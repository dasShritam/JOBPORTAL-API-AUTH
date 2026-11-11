import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitJobPostQuestionSchema = new Schema<any>(
	{
		jobid: { type: SchemaTypes.ObjectId, required: true },
		/*Questions to ask*/
		qn: { type: SchemaTypes.String, required: true },
		/*Question type*/
		type: { type: SchemaTypes.String, required: true },
		/*Populated when user selects Multiple choice*/
		opt: [
			{
				val: { type: SchemaTypes.String },
				pref: { type: SchemaTypes.Boolean }
			}
		],
		/*Is mandatory*/
		req: { type: SchemaTypes.Boolean, default: false },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitJobPostQuestionSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitJobPostQuestion', RecruitJobPostQuestionSchema, 'RecruitJobPostQuestions');

export { createRecruitJobPostQuestionSchema, RecruitJobPostQuestionSchema };
