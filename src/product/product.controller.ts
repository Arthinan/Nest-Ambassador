import { Body, CacheInterceptor, CacheKey, CacheTTL, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, Inject, Param, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import { randomInt } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { Product } from './product';

@Controller()
export class ProductController {

    constructor(
        private readonly productService:ProductService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private eventEmitter: EventEmitter2
    ){}

    @UseGuards(AuthGuard)
    @Get('admin/products')
    async getAll(){
        return this.productService.find({})
    }

    @UseGuards(AuthGuard)
    @Post('admin/product/create')
    async create(@Body() body: ProductCreateDto){
        const product = await this.productService.save(body);
        this.eventEmitter.emit('product_updated');
        return product;
    }

    @UseGuards(AuthGuard)
    @Get('admin/product/:id')
    async get(@Param('id') id:number){
        return this.productService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Put('admin/product/:id')
    async update(@Param('id') id:number, @Body() body: ProductCreateDto){
        await this.productService.update(id,body);

        this.eventEmitter.emit('product_updated');

        return this.productService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Delete('admin/product/:id')
    async delete(@Param('id') id:number){
        const response = await this.productService.delete(id);
        this.eventEmitter.emit('product_updated');
        return response;
    }

    @UseGuards(AuthGuard)
    @Post('admin/seed/products')
    async seedProducts(){
        for (let i = 0; i < 30; i++) { //loop fake data save to database
            await this.productService.save({
                title:faker.lorem.words(2),
                description:faker.lorem.words(10),
                image:faker.image.imageUrl(200,200,'',true),
                price:randomInt(10,100)
            });
        }
        return { message: 'Seed Success'};
    }

    @CacheKey('products_frontend')
    @CacheTTL(30 * 60)
    @UseInterceptors(CacheInterceptor)
    @Get('ambassador/products/frontend')
    async frontend(){
        return this.productService.find();
    }

    @Get('ambassador/products/backend')
    async backend(@Req() request:Request){
        let products = await this.cacheManager.get<Product[]>('products_backend');

        if (!products) {
            products = await this.productService.find();

            await this.cacheManager.set('products_backend', products, {ttl: 1800})
        }

        if (request.query.search) {
            const search = request.query.search.toString().toLowerCase();
            products = products.filter(product => product.title.toLowerCase().indexOf(search) >= 0 || product.description.toLowerCase().indexOf(search) >= 0);
        }

        if (request.query.sort === 'asc' || request.query.sort === 'desc') {
            products.sort((a, b) => {

                const diff = a.price - b.price;

                if (diff === 0) return 0 ;

                const sign = Math.abs(diff) / diff; //-1,1

                return request.query.sort === 'asc' ? sign : -sign; //sort by price
            })
        }

        return products;
    }
}
