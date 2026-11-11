import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogSubscriptionSchema = new Schema<any>(
	{
		co_id: { type: SchemaTypes.ObjectId, required: true },
		/*Employer can access jobseeker profiles from date*/
		from: { type: SchemaTypes.Number, required: true },
		/*Employer can access jobseeker profiles till date*/
		till: { type: SchemaTypes.Number, required: true },
		/*Remaining jobseeker profile access count*/
		curr_bl: { type: SchemaTypes.Number, required: true },
		/*Total avilable jobseeker profile access count*/
		avil_bl: { type: SchemaTypes.Number, required: true },
		updated_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogSubscriptionSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('LogSubscription', LogSubscriptionSchema, 'LogSubscriptions');

export { createLogSubscriptionSchema, LogSubscriptionSchema };
