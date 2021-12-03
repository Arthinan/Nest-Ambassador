import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

    constructor(
        private userService:UserService,
        private jwtService:JwtService
        ){}

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
        @Body('password') password: string,
        @Res({passthrough: true}) response: Response

        ){
        const user = await this.userService.login({email});
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException("Invalid credential");
        }

        const jwt = await this.jwtService.signAsync({
            id: user.id
        });

        response.cookie('jwt',jwt,{httpOnly:true});
        return {
            message: 'success'
        };
    }

    @Get('admin/user')
    async user(@Req() request:Request){
        const cookie = request.cookies['jwt'];

        //Authen
        const { id } = await this.jwtService.verifyAsync(cookie);
        const user = await this.userService.login({id});

        return user;
    }
}
