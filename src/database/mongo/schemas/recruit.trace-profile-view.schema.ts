import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitTraceProfileViewSchema = new Schema<any>(
	{
		co_id: { type: SchemaTypes.ObjectId, required: true },
		user_id: { type: SchemaTypes.ObjectId, required: true, unique: true },
		vw_on: { type: SchemaTypes.Number },
		vw_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitTraceProfileViewSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitTraceProfileView', RecruitTraceProfileViewSchema, 'RecruitTraceProfileViews');

export { createRecruitTraceProfileViewSchema, RecruitTraceProfileViewSchema };
