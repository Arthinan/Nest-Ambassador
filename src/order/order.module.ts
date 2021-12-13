import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item';
import { Order } from './order';
import { OrderItemService } from './order-item.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Order, OrderItem])
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService]
})
export class OrderModule {}
