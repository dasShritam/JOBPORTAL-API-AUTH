import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitFollowerSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId, required: true },
		fllr_id: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createRecruitFollowerSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitFollower', RecruitFollowerSchema, 'RecruitFollowers');

export { createRecruitFollowerSchema, RecruitFollowerSchema };
