import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const NotificationPollSchema = new Schema<any>(
	{
		/*Title of the poll*/
		title: { type: SchemaTypes.String, required: true, unique: true },
		/*Poll description*/
		desc: { type: SchemaTypes.String, required: true },
		/*Question type -> Signle choice or mupltiple choice*/
		type: { type: SchemaTypes.String, required: true },
		/*Options*/
		opt: [
			{
				/*Includes _id*/
				/*Option*/
				val: { type: SchemaTypes.String, required: true },
				vote: { type: SchemaTypes.Number }
			}
		],
		/*Accessible roles. If empty available for all the users*/
		a11y: { type: SchemaTypes.Array, default: [] },
		/*Start of posted poll*/
		start_ts: { type: SchemaTypes.Number, required: true },
		/*End date of poll. If null poll never expires*/
		end_ts: { type: SchemaTypes.Number, required: true, default: null },
		created_by: { type: SchemaTypes.ObjectId, required: true },
		updated_by: { type: SchemaTypes.ObjectId },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createNotificationPollSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('NotificationPoll', NotificationPollSchema, 'NotificationPolls');

export { createNotificationPollSchema, NotificationPollSchema };
