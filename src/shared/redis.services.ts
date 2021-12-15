import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { RedisClient } from 'redis'

@Injectable()
export class RedisService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ){}

    getClient():Redis.Redis {
        const store:any = this.cacheManager.store;

        return store.getClient();
    }
}