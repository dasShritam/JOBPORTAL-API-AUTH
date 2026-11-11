import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogAppSessionSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId, required: true },
		role: { type: SchemaTypes.String, required: true },
		start_ts: { type: SchemaTypes.Number, required: true },
		end_ts: { type: SchemaTypes.Number, required: true },
		device: {
			_id: false,
			id: { type: SchemaTypes.String, required: true },
			ua: { type: SchemaTypes.String, required: true } /*Browser related information i.e User Agent*/
		},
		ip: [
			{
				_id: false,
				adr: { type: SchemaTypes.String, required: true } /*IP Address*/,
				start_ts: { type: SchemaTypes.Number, required: true }
			}
		],
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogAppSessionSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('LogAppSession', LogAppSessionSchema, 'LogAppSessions');

export { createLogAppSessionSchema, LogAppSessionSchema };
