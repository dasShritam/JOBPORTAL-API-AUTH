import { Types } from 'mongoose';

export interface AppSessionModel {
	_id?: Types.ObjectId | string;
	user_id?: Types.ObjectId | string;
	role?: string;
	start_ts?: number;
	end_ts?: number;
	device?: {
		id?: string;
		ua?: string;
	};
	ip?: [
		{
			adr?: string;
			start_ts?: number;
		}
	];
	created_at?: number;
	updated_at?: number;
}
