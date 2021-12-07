import { NestFactory } from "@nestjs/core";
import faker from "faker";
import { AppModule } from "src/app.module";
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);

    const password = await bcrypt.hash("1234",12);

    for (let i = 0; i < 30; i++) { //loop fake data save to database
        await userService.save({
            first_name:faker.name.findName(),
            last_name:faker.name.lastName(),
            email:faker.internet.email(),
            password,
            is_ambassador:true
        });
    }
    process.exit();
})();