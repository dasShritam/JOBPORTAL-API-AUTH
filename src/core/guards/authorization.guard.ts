import { messages } from '@app/shared/messages.shared';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppServices } from '../constants/app-svc.constant';
import AppLogger from '../logger/app-logger';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly reflector: Reflector, private readonly _logger: AppLogger) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const secured = this.reflector.get<string>(AppServices.SECURED, context.getHandler());

			/*If API is not authorized return true always*/
			if (!secured) {
				return true;
			}

			/*Extract bearer token from header and validate*/
			const request = context.switchToHttp().getRequest();
			let bearerToken = request.headers['authorization'];

			if (!bearerToken) {
				throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
			}

			bearerToken = bearerToken.replace('Bearer', '').trim();
			if (!bearerToken) {
				throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
			}

			/*Extract payload from jwt*/
			bearerToken = bearerToken.split('.');

			if (bearerToken.length !== 3) {
				throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
			}

			/*Decode jwt token using buffer constructor and append to request object*/
			request.claims = JSON.parse(Buffer.from(bearerToken[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'));

			return true;
		} catch (error) {
			this._logger.error(error.stack, HttpStatus.UNAUTHORIZED);
			throw new HttpException(messages.E3, HttpStatus.UNAUTHORIZED);
		}
	}
}
