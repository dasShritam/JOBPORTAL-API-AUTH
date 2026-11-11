import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogEmailSchema = new Schema<any>(
	{
		/*Email sender*/
		from: { type: SchemaTypes.String, required: true },
		/*Email to*/
		to: { type: SchemaTypes.String },
		/*Email  carbon copy*/
		cc: { type: SchemaTypes.String },
		/*Email blind carbon copy*/
		bcc: { type: SchemaTypes.String },
		/*Email subject*/
		sub: { type: SchemaTypes.String, required: true },
		/*Email body*/
		body: { type: SchemaTypes.String, required: true },
		/*Email attachments name with extension*/
		atch: { type: SchemaTypes.Array, default: [] },
		/*Email send status - QUEUED,SENT,FAILED*/
		sts: { type: SchemaTypes.String, required: true },
		/*Email retry*/
		retry: { type: SchemaTypes.Number, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogEmailSchema: (conn: Connection) => any = (conn: Connection) => conn.model<any>('LogEmail', LogEmailSchema, 'LogEmails');

export { createLogEmailSchema, LogEmailSchema };
