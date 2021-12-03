import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {

    @Post('admin/register')
    register(@Body() body:RegisterDto){
        return body;
    }
}
