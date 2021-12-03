import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
@Controller()
export class AuthController {

    constructor(private userService:UserService){}

    @Post('admin/register')
    async register(@Body() body:RegisterDto){
        const { password_confirm, ...data } = body;  //เอา password_confirm ออกจาก data

        if (body.password !== password_confirm) {
            throw new BadRequestException("Passwords do not match");
        }

        const hashed =  await bcrypt.hash(body.password, 12);

        return this.userService.register({
            ...data,
            password:hashed,
            is_ambassador: false
        });
    }

    @Post('admin/login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string
        ){
        const user = await this.userService.login({email});
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException("Invalid credential");
        }

        return user;
    }
}
