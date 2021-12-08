import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';

@Controller()
export class ProductController {

    constructor(
        private readonly productService:ProductService
    ){}

    @Get('admin/products')
    async all(){
        return this.productService.find({})
    }

    @Post('admin/product/create')
    async create(@Body() body: ProductCreateDto){
        return this.productService.save(body);
    }
}
