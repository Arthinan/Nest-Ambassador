import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
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

        return this.userService.save({
            ...data,
            password:hashed,
            is_ambassador: false
        });
    }
}
