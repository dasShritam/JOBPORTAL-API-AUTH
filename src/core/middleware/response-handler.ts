import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseHandler implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const ctx = context.switchToHttp(),
			res = ctx.getResponse<Response>();
		return next.handle().pipe(
			map((data) => {
				if (data.code) {
					res.status(data.code);
				}
				return data;
			})
		);
	}
}
