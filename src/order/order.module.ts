import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item';
import { Order } from './order';
import { OrderItemService } from './order-item.service';
import { SharedModule } from 'src/shared/shared.module';
import { LinkModule } from '../link/link.module';
import { ProductModule } from 'src/product/product.module';
import { StripeModule } from 'nestjs-stripe';

@Module({
  imports:[
    TypeOrmModule.forFeature([Order, OrderItem]), SharedModule, LinkModule, ProductModule,
    StripeModule.forRoot({
          apiKey: 'sk_test_51K7CnWBcHdiP9KIZY7nWlyqOWOO72bDRXzp8BSdoadHEcTmTpautwRiTRbuCVJ03Hqatrvb81jCs7iBJ8fumMgjY00FX5VlLum',
          apiVersion: '2020-08-27',
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService]
})
export class OrderModule {}
