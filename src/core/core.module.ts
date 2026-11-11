import { exportProvider, getProviders } from '@app/core/providers';
import { DatabaseModule } from '@app/database/database.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
	imports: [ConfigModule.forRoot(), DatabaseModule, MailModule],
	providers: [...getProviders()],
	exports: [...exportProvider()]
})
export class CoreModule {}
