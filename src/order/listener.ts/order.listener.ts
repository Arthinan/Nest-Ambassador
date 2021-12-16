import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RedisService } from "src/shared/redis.services";
import { Order } from 'src/order/order';

@Injectable()
export class OrderListener {

    constructor(private redisService: RedisService){}

    @OnEvent('order.completed')
    async handlerOrderCompleteEvent(order:Order){
        const client = this.redisService.getClient();
        client.zincrby('rankings', order.ambassador_revenue, order.user.name);
    }
}