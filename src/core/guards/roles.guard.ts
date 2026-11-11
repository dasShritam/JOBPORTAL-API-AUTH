import { AppServices } from '@app/core/constants/app-svc.constant';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}
	canActivate(context: ExecutionContext): boolean {
		const value = this.reflector.get<{ roles: string[]; permissions?: string[]; validate: boolean }>(AppServices.HAS_ROLES, context.getHandler());

		/*If API is not authorized return true always*/
		if (!value) {
			return true;
		}

		const { roles, permissions } = value,
			req = context.switchToHttp().getRequest();

		/*Validate roles*/
		if (!roles || !roles.length) return true;

		if (!req.claims.roles || !req.claims.roles.some((r: string) => roles.includes(r.toUpperCase()))) {
			throw new HttpException(messageFactory(messages.E21, [req.url]), HttpStatus.FORBIDDEN);
		}

		/*Validate permissions*/
		if (!permissions || !permissions.length) return true;

		if (!req.claims.permission || !req.claims.permission.some((p: string) => permissions.includes(p.toUpperCase()))) {
			throw new HttpException(messages.E22, HttpStatus.FORBIDDEN);
		}
		return true;
	}
}
