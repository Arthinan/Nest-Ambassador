import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret:"#>j}CxeM-$ASXHabzCUtV?'Y:~{Q8C~9b',[h<g$n2VWSk$CE}hDY^D/w2>Zy]A",
      signOptions: {expiresIn: '1d'}
    }),
    UserModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
