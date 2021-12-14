import { ClassSerializerInterceptor, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as faker from 'faker';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderItemService } from './order-item.service';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
    constructor(
        private orderService:OrderService,
        private orderItemService:OrderItemService
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
}
