import { Types } from 'mongoose';

interface AtPayload {
	readonly sub: Types.ObjectId;
	readonly roles: string[];
	readonly sid: Types.ObjectId;
	readonly username: string;
	readonly name: string;
	readonly ip_address: string;
	company_id?: string;
	permission?: string[];
}

interface RtPayload {
	readonly sub: Types.ObjectId;
	readonly sid: Types.ObjectId;
	readonly username: string;
	readonly name: string;
}

export { AtPayload, RtPayload };
