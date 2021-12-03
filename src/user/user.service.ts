import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepository:Repository<User>
    ){}

    async register(options){
        return this.userRepository.save(options);
    }

    async login(options){
        return this.userRepository.findOne(options);
    }

}
