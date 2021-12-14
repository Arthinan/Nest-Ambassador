import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cache } from 'cache-manager';

@Injectable()
export class ProductListener {

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ){}

    @OnEvent('product_updated') //เมื่อ event นี้มีการทำงาน จะมา่ทำคำสั่งด้านล่าง
    async handleProductUpdatedEvent(){
        await this.cacheManager.del('products_frontend'); //delete cache
        await this.cacheManager.del('products_backend');
    }
}