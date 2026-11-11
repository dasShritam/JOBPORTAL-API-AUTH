import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SecurityTemporaryTokenSchema = new Schema<any>(
	{
		token: { type: SchemaTypes.String, required: true, unique: true },
		user_id: { type: SchemaTypes.ObjectId, default: null },
		ip: { type: SchemaTypes.String, required: true },
		data: { type: SchemaTypes.String, default: null },
		exp_ts: { type: SchemaTypes.Number, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts, shardKey: { token: 1 } }
);

SecurityTemporaryTokenSchema.index({ token: 'hashed', exp_ts: 1 });

const createSecurityTemporaryTokenSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SecurityTemporaryToken', SecurityTemporaryTokenSchema, 'SecurityTemporaryTokens');

export { createSecurityTemporaryTokenSchema, SecurityTemporaryTokenSchema };
