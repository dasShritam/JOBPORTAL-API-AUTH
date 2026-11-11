import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const NotificationPollResponseSchema = new Schema<any>(
	{
		/*User Id*/
		user_id: { type: SchemaTypes.ObjectId, required: true },
		/*Poll id*/
		poll_id: { type: SchemaTypes.ObjectId, ref: 'NotificationPolls', required: true },
		/*Answers given by the users which contains list of option id from NotificationPolls. It can be one ans or multiple answer*/
		ans: { type: SchemaTypes.Array, default: [] },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createNotificationPollResponseSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('NotificationPollResponse', NotificationPollResponseSchema, 'NotificationPollResponses');

export { createNotificationPollResponseSchema, NotificationPollResponseSchema };
