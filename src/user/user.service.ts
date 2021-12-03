import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepositoryL:Repository<User>
    ){}

    async save(option){
        return this.userRepositoryL.save(option);
    }

}
