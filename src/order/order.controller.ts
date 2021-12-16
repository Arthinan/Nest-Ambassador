import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as faker from 'faker';
import { AuthGuard } from 'src/auth/auth.guard';
import { Link } from 'src/link/link';
import { LinkService } from 'src/link/link.service';
import { Product } from 'src/product/product';
import { ProductService } from 'src/product/product.service';
import { Connection } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './order';
import { OrderItem } from './order-item';
import { OrderItemService } from './order-item.service';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
    constructor(
        private orderService:OrderService,
        private orderItemService:OrderItemService,
        private linkService:LinkService,
        private productService:ProductService,
        private connection: Connection
    ){}

    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('admin/orders')
    all(){
        return this.orderService.find({
            relations:['order_items']
        });
    }

    @UseGuards(AuthGuard)
    @Post('admin/seed/orders')
    async seedOrders(){
        for (let i = 0; i < 30; i++) { //loop fake data save to database
            const order = await this.orderService.save({
                user_id:randomInt(2,31),
                code:faker.lorem.slug(2),
                ambassador_email:faker.internet.email(),
                first_name:faker.name.firstName(),
                last_name:faker.name.lastName(),
                email:faker.internet.email(),
                complete:true
            });

            for (let j = 0; j < randomInt(1,5); j++) {
                await this.orderItemService.save({
                    order,
                    product_title:faker.lorem.words(2),
                    price:randomInt(10,100),
                    quantity:randomInt(1,5),
                    admin_revenue:randomInt(10,100),
                    ambassador_revenue:randomInt(1,10)
                });
            }
        }
        return { message: 'Seed Success'};
    }

    @Post('checkout/orders')
    async create(@Body() body:CreateOrderDto){
        const link: Link = await this.linkService.findOne({
            code: body.code,
            relations:['user']
        });

        if (!link) {
            throw new BadRequestException('Invalid link');
        }

        const queryRunner = this.connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const order = new Order();
            order.user_id = link.user.id;
            order.ambassador_email = link.user.email;
            order.first_name = body.first_name;
            order.last_name = body.last_name;
            order.address = body.address;
            order.country = body.country;
            order.city = body.city;
            order.zip = body.zip;
            order.code = body.code;
            order.email = body.email;

            const saveOrder = await queryRunner.manager.save(order);

            for (let p of body.products){
                const product:Product = await this.productService.findOne({id: p.product_id});

                const orderItem = new OrderItem();
                orderItem.order = order;
                orderItem.product_title = product.title;
                orderItem.price = product.price;
                orderItem.quantity = p.quantity;
                orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
                orderItem.admin_revenue = 0.9 * product.price * p.quantity;

                await queryRunner.manager.save(orderItem);
            }

            await queryRunner.commitTransaction();
            return saveOrder;

        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw new BadRequestException();
        } finally {
            await queryRunner.release();
        }

    }
}
