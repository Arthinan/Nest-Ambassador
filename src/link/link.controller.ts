import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { LinkService } from './link.service';
import { Request } from 'express';

@Controller()
export class LinkController {
    constructor(
        private linkService: LinkService,
        private authService: AuthService
    ){}

    @UseGuards(AuthGuard)
    @Get('admin/users/:id/links')
    async all(@Param('id') id:number){
        return this.linkService.find({
            user:id,
            relations:['orders']
        });
    }

    @UseGuards(AuthGuard)
    @Post('ambassador/links')
    async create(
        @Body('products') products:number[],
        @Req() request:Request
    ){
        const user = await this.authService.user(request);
        return this.linkService.save({
            code: Math.random().toString(36).substring(6),
            user,
            products: products.map(id => ({id}))
        })
    }
}
