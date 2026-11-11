import { CoreModule } from '@app/core/core.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [CoreModule, AuthModule],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
