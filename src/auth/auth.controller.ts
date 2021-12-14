import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, NotFoundException, Post, Put, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

    constructor(
        private userService:UserService,
        private jwtService:JwtService
        ){}

    @Post(['admin/register', 'ambassador/register'])
    async register(@Body() body:RegisterDto, @Req() request:Request){
        const { password_confirm, ...data } = body;  //เอา password_confirm ออกจาก data

        if (body.password !== password_confirm) {
            throw new BadRequestException("Passwords do not match");
        }

        const hashed =  await bcrypt.hash(body.password, 12);

        return this.userService.save({
            ...data,
            password:hashed,
            is_ambassador: request.path === '/api/ambassador/register'
        });
    }

    @Post(['admin/login', 'ambassador/login'])
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({passthrough: true}) response: Response,
        @Req() request: Request

        ){
        const user = await this.userService.findOne({email});
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException("Invalid credential");
        }

        const admin_login = request.path === '/api/admin/login';

        if (user.is_ambassador && admin_login) {
            throw new UnauthorizedException();
        }

        const jwt = await this.jwtService.signAsync({
            id: user.id,
            scope: admin_login ? 'admin' : 'ambassador'
        });

        response.cookie('jwt',jwt,{httpOnly:true});
        return {
            message: 'Login success'
        };
    }

    @UseGuards(AuthGuard)
    @Get(['admin/user', 'ambassador/user'])
    async user(@Req() request:Request){
        const cookie = request.cookies['jwt'];
        const { id } = await this.jwtService.verifyAsync(cookie);

        if (request.path === '/api/admin/user') {
            console.log('admin');
            const user = await this.userService.findOne({id});
            return user
        } else {
            const user_ambassador = await this.userService.findOne({id});
            const user_revenue = await this.userService.findOne({id, relations:['orders', 'orders.order_items']})
            const {orders, password, ...data} = user_ambassador;
            return {
                ...data,
                revenue: user_revenue.revenue
            }
        }
    }

    @UseGuards(AuthGuard)
    @Post(['admin/logout', 'ambassador/logout'])
    async logout(@Res({passthrough:true}) response:Response){
        response.clearCookie('jwt');
        return{
            message:'Logout success'
        }
    }

    @UseGuards(AuthGuard)
    @Put(['admin/user/info', 'ambassador/user/info'])
    async updateInfo(
        @Req() request:Request,
        @Body('first_name') first_name:string,
        @Body('last_name') last_name:string,
        @Body('email') email:string,
    ){
        const cookie = request.cookies['jwt'];

        const { id } = await this.jwtService.verifyAsync(cookie);

        await this.userService.update(id,{
            first_name,
            last_name,
            email
        })
        return this.userService.findOne({id});
    }

    @UseGuards(AuthGuard)
    @Put(['admin/user/password','ambassador/user/password'])
    async updatePassword(
        @Req() request:Request,
        @Body('password') password:string,
        @Body('password_confirm') password_confirm:string,
    ){
        if (password !== password_confirm) {
            throw new BadRequestException("Passwords do not match");
        }

        const cookie = request.cookies['jwt'];

        const { id } = await this.jwtService.verifyAsync(cookie);

        await this.userService.update(id,{
            password: await bcrypt.hash(password,12)
        });
        return this.userService.findOne({id});
    }

}
