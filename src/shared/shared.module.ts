import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.services';

@Module({
    imports: [
        JwtModule.register({
            secret:"#>j}CxeM-$ASXHabzCUtV?'Y:~{Q8C~9b',[h<g$n2VWSk$CE}hDY^D/w2>Zy]A",
            signOptions: {expiresIn: '1d'}
        }), CacheModule.register({
            store: redisStore,
            // Store-specific configuration:
            host: '127.0.0.1',
            port: 6379,
        }),
    ],
    providers: [RedisService],
    exports: [JwtModule, CacheModule, RedisService]
})
export class SharedModule {}
