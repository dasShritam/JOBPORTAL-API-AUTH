import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SupportTicketActivitySchema = new Schema<any>(
	{
		tktid: { type: SchemaTypes.ObjectId, ref: 'SupportTickets', required: true },
		msg: { type: SchemaTypes.String, required: true },
		created_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createSupportTicketActivitySchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SupportTicketActivity', SupportTicketActivitySchema, 'SupportTicketActivities');

export { createSupportTicketActivitySchema, SupportTicketActivitySchema };
