import { Types } from 'mongoose';

export interface TemporaryTokenModel {
	token: string;
	user_id?: Types.ObjectId;
	ip?: string;
	data?: string;
	exp_ts?: number;
	created_at?: number;
	updated_at?: number;
}
