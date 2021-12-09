import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import { randomInt } from 'crypto';

@Controller()
export class ProductController {

    constructor(
        private readonly productService:ProductService
    ){}

    @Get('admin/products')
    async getAll(){
        return this.productService.find({})
    }

    @Post('admin/product/create')
    async create(@Body() body: ProductCreateDto){
        return this.productService.save(body);
    }

    @Get('admin/product/:id')
    async get(@Param('id') id:number){
        return this.productService.findOne(id);
    }

    @Put('admin/product/:id')
    async update(@Param('id') id:number, @Body() body: ProductCreateDto){
        await this.productService.update(id,body);
        return this.productService.findOne(id);
    }

    @Delete('admin/product/:id')
    async delete(@Param('id') id:number){
        return this.productService.delete(id);
    }

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
}
