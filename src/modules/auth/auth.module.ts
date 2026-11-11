import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AbstractAuthSvc } from './auth.abstract';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [
		{
			provide: AbstractAuthSvc,
			useClass: AuthService
		},
		JwtService
	]
})
export class AuthModule {}
