import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports:[
        TypeOrmModule.forFeature([User]), SharedModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}
