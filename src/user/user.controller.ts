import { Controller, Get, Post, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(private readonly userService:UserService){}

    @UseGuards(AuthGuard)
    @Get('admin/ambassadors')
    ambassadors(){
        return this.userService.find({
            is_ambassador:true
        });
    }

    @UseGuards(AuthGuard)
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
}
