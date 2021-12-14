import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret:"#>j}CxeM-$ASXHabzCUtV?'Y:~{Q8C~9b',[h<g$n2VWSk$CE}hDY^D/w2>Zy]A",
            signOptions: {expiresIn: '1d'}
        }),
    ],
    exports: [JwtModule]
})
export class SharedModule {}
