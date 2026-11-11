import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SupportTicketSchema = new Schema<any>(
	{
		/*Service request number*/
		srn: { type: SchemaTypes.String, required: true },
		/*Name of the person seeking for assistance*/
		name: { type: SchemaTypes.String, required: true },
		/*Contact information*/
		ci: {
			/*Phone which includes country code*/
			ph: { type: SchemaTypes.String, required: true },
			/*Email*/
			mail: { type: SchemaTypes.String, required: true },
			reg_user: { type: SchemaTypes.Boolean, default: false }
		},
		/*Detailed description about issue of user facing*/
		desc: { type: SchemaTypes.String, required: true },
		/*Default : OPEN , Status can be OPEN or CLOSED*/
		status: { type: SchemaTypes.String, required: true },
		/*Category which come from generic master E.g Search, Apply */
		ctgy: { type: SchemaTypes.String, required: true },
		/*Support attachement*/
		atch: { type: SchemaTypes.String } /*File name with extension*/,
		updated_by: { type: SchemaTypes.ObjectId },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createSupportTicketSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SupportTicket', SupportTicketSchema, 'SupportTickets');

export { createSupportTicketSchema, SupportTicketSchema };
