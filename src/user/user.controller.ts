import { Controller, Get, Post, UseInterceptors, ClassSerializerInterceptor, UseGuards, Res } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisService } from 'src/shared/redis.services';
import {Response} from "express";
import { User } from './user';

@UseGuards(AuthGuard)
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(
        private readonly userService:UserService,
        private redisService:RedisService
        ){}

    @Get('admin/ambassadors')
    ambassadors(){
        return this.userService.find({
            is_ambassador:true
        });
    }

    @Post('admin/seed/ambassadors')
    async seedAmbassador(){
        const password = await bcrypt.hash("1234",12);

        for (let i = 0; i < 30; i++) { //loop fake data save to database
            await this.userService.save({
                first_name:faker.name.firstName(),
                last_name:faker.name.lastName(),
                email:faker.internet.email(),
                password,
                is_ambassador:true
            });
        }
        return { message: 'Seed Success'};
    }

    @Get('ambassador/rankings')
    async rankings(@Res() response:Response
    ) {
        const client = this.redisService.getClient();

        client.zrevrangebyscore('rankings', '+inf', '-inf', 'WITHSCORES', (err, result) => {

            response.send(result)
        });

        // const ambassador = this.userService.find({
        //     is_ambassador:true,
        //     relations:['orders', 'orders.order_items']
        // });

        // return (await ambassador).map(ambassador => {
        //     return {
        //         name: ambassador.name,
        //         revenue: ambassador.revenue
        //     }
        // })
    }

    @Post('ambassador/commandRankings')
    async commandRankings(){
        const ambassador: User[] = await this.userService.find({
            is_ambassador:true,
            relations:['orders', 'orders.order_items']
        });

        const client = this.redisService.getClient();

        for (let i = 0; i < this.ambassadors.length; i++) {
            await client.zadd('rankings', this.ambassadors[i].revenue, this.ambassadors[i].name);
        }
        return { message: 'CommandRankings Success'};
    }
}
