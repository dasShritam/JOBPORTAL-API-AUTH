import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const NotificationConversationActionSchema = new Schema<any>(
	{
		/*Notification id from notification conversation collection*/
		notif_id: { type: SchemaTypes.ObjectId, required: true, ref: 'NotificationConversationActions' },
		user_id: { type: SchemaTypes.ObjectId, required: true, ref: 'SecurityUserAccounts' },
		/*Is message read by user*/
		read: { type: SchemaTypes.Boolean, default: false },
		/*Deleted or not*/
		del: { type: SchemaTypes.Boolean, default: false },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createNotificationConversationActionSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('NotificationConversationAction', NotificationConversationActionSchema, 'NotificationConversationActions');

export { createNotificationConversationActionSchema, NotificationConversationActionSchema };
