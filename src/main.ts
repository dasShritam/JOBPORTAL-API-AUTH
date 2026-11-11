import { AppConfigService } from '@app/config/appconfig.service';
import coreBootstrap from '@app/core/bootstrap';
import AppLogger from '@app/core/logger/app-logger';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule),
		configObj = app.get(AppConfigService),
		logger = app.get(AppLogger),
		appConfig = configObj.get('app'),
		port = appConfig.port,
		env = configObj.get('app').environment;
	/*start the server*/
	try {
		/* core bootstrap config, environment, pipe, guards, intereceptors etc...*/
		coreBootstrap(app, configObj);
		await app.listen(port, () => {
			const successMsg = messageFactory(`${env.toUpperCase()} ${messages.G1} ${messages.S13}`, [port]);
			logger.log(successMsg, 200);
		});
	} catch (err) {
		const errMsg = messageFactory(messages.E1, [err.message]);
		logger.error(errMsg, 500);
	}
}

bootstrap();
