import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';
const SecurityOtpTraceSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId },
		txn_id: { type: SchemaTypes.String, required: true } /*Value will be available when using 3rd party vendors*/,
		to: { type: SchemaTypes.String, required: true },
		ip: { type: SchemaTypes.String, required: true },
		otp: { type: SchemaTypes.Number },
		exp_ts: { type: SchemaTypes.Number, required: true } /*Expiry time*/,
		verified: { type: SchemaTypes.Boolean, default: false },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createSecurityOtpTraceSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SecurityOtpTrace', SecurityOtpTraceSchema, 'SecurityOtpTraces');

export { createSecurityOtpTraceSchema, SecurityOtpTraceSchema };
