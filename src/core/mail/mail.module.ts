import { AppConfigService } from '@app/config/appconfig.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { AuthMailService } from './mail.service';

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: async (configService: AppConfigService) => ({
				...configService.get('mailConfig')
			}),
			inject: [AppConfigService]
		})
	],
	providers: [AuthMailService],
	exports: [AuthMailService]
})
export class MailModule {}
