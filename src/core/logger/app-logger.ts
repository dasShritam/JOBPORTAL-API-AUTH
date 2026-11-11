import { AppConfigService } from '@app/config/appconfig.service';
import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import { winstonAzureBlob } from 'winston-azure-blob';
import { unix_ts_now } from '../utils/timestamp.utils';

enum WinstonLogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	HTTP = 'http',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
	SILLY = 'silly'
}

@Injectable()
export default class AppLogger implements LoggerService {
	public logger: Logger;
	private readonly loggerChannels = [];
	constructor(_appConfigSvc: AppConfigService) {
		const blobCred = _appConfigSvc.get('blobStorage'),
			loggerConfig = _appConfigSvc.get('logger'),
			{ combine, timestamp, label, json } = format,
			{ Console } = transports;

		this.loggerChannels.push(new Console());

		/**
		 * Log error into azure storage account
		 */

		this.loggerChannels.push(
			winstonAzureBlob({
				account: {
					name: blobCred.blobAccountName,
					key: blobCred.blobAccountKey
				},
				containerName: blobCred.blobLoggerContainer,
				blobName: 'app-logs/jobportal-api-auth-logs-combined',
				rotatePeriod: 'YYYY-MM-DD'
			})
		);
		this.loggerChannels.push(
			winstonAzureBlob({
				account: {
					name: blobCred.blobAccountName,
					key: blobCred.blobAccountKey
				},
				containerName: blobCred.blobLoggerContainer,
				level: 'error',
				blobName: 'errors/jobportal-api-auth-logs-errors',
				rotatePeriod: 'YYYY-MM-DD'
			})
		);
		const logFormat = combine(label({ label: 'JOBPORTAL-API-AUTH' }), timestamp({ format: () => unix_ts_now().toString() }), json());

		this.logger = createLogger({
			level: loggerConfig.logLevel || 'info',
			format: logFormat,
			transports: this.loggerChannels
		});
	}

	log(msg: any, status = 200, sid = '') {
		this.logger.log(WinstonLogLevel.INFO, { msg, status, sid });
	}
	error(msg: any, status = 500, sid = '') {
		this.logger.log(WinstonLogLevel.ERROR, { msg, status, sid });
	}
	warn(msg: any, route = '', status = 206, sid = '') {
		this.logger.log(WinstonLogLevel.WARN, { msg, route, status, sid });
	}
	debug?(msg: any, status = 200, sid = '') {
		this.logger.log(WinstonLogLevel.DEBUG, { msg, status, sid });
	}
	verbose?(msg: any, status = 200, sid = '') {
		this.logger.log(WinstonLogLevel.VERBOSE, { msg, status, sid });
	}
}
