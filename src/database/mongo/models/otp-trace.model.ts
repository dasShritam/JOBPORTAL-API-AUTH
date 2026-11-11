import { Types } from 'mongoose';

export interface OtpTraceModel {
	user_id?: string | Types.ObjectId;
	txn_id?: string /*Value will be available when using 3rd party vendors*/;
	to?: string;
	ip?: string;
	otp?: number;
	exp_ts?: number /*Expiry time*/;
	verified?: boolean;
	created_at?: number;
	updated_at?: number;
}
