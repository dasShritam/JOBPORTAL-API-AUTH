import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

enum NOTIFICATION_STATUS {
	SENT = 'SENT',
	DELIVERED = 'DELIVERED',
	FAILED = 'FAILED'
}

enum DEVICE {
	WEB = 'WEB'
}

const NotificationConversationSchema = new Schema<any>(
	{
		title: { type: SchemaTypes.String, required: true },
		/*Sample Content
					{msg:"Welcome",code:"001"} in string
			*/
		cont: { type: SchemaTypes.String, required: true },
		/*Sender*/
		sndr: { type: SchemaTypes.ObjectId },
		/*Recipients of notification*/
		rcpt: [{ _id: false, type: SchemaTypes.ObjectId, ref: 'SecurityUserAccounts' }],
		/*Role/User group who have access to posted notification*/
		role: [{ _id: false, type: SchemaTypes.String }],
		/*Notification status*/
		sts: { type: SchemaTypes.String, default: NOTIFICATION_STATUS.SENT },
		/*Device Information*/
		device: { type: SchemaTypes.Array, default: [DEVICE.WEB] },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createNotificationConversationSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('NotificationConversation', NotificationConversationSchema, 'NotificationConversations');

export { createNotificationConversationSchema, NotificationConversationSchema };
