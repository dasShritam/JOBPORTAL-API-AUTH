import { AppConfigService } from '@app/config/appconfig.service';
import AppLogger from '@app/core/logger/app-logger';
import { DatabaseModule } from '@app/database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/authorization.guard';
import { TempAuthGuard } from './guards/temp-authorization.guard';
import { MailModule } from './mail/mail.module';

export const getProviders = (): any[] => {
	return [AppLogger, AppConfigService, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_GUARD, useClass: TempAuthGuard }];
};

export const exportProvider = (): any[] => {
	return [AppLogger, AppConfigService, DatabaseModule, MailModule];
};
