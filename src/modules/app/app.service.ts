import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	async status(): Promise<AppResponse> {
		return createResponse(200, `${messages.G1} ${messages.S1}`);
	}
}
