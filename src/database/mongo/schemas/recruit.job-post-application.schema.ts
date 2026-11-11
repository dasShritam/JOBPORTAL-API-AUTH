import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitJobPostApplicationSchema = new Schema<any>(
	{
		co_id: { type: SchemaTypes.ObjectId, required: true },
		jobid: { type: SchemaTypes.ObjectId, required: true },
		user_id: { type: SchemaTypes.ObjectId, required: true },
		/*Should be available when employer linked questions with job posts*/
		qna: [
			{
				_id: false,
				/*Questions asked by the employer during job post*/
				qnid: { type: SchemaTypes.ObjectId },
				qn: { type: SchemaTypes.String },
				ans: { type: SchemaTypes.Array, default: [] },
				created_at: { type: SchemaTypes.Number },
				updated_at: { type: SchemaTypes.Number }
			}
		],
		/*Should be available when employer checked include video*/
		siv: {
			name: { type: SchemaTypes.String },
			updated_at: { type: SchemaTypes.Number }
		},
		/*Milestones of activity done by employer or job seeker*/
		ms: [
			{
				_id: false,
				/*Status E.g Saved, Applied or Rejected */
				sts: { type: SchemaTypes.String },
				/*Person who modified the status*/
				updated_by: { type: SchemaTypes.ObjectId, required: true },
				created_at: { type: SchemaTypes.Number, required: true },
				updated_at: { type: SchemaTypes.Number }
			}
		],
		/*Feedbacks*/
		fdbk: [
			{
				/*Comment*/
				cmt: { type: SchemaTypes.String },
				/*Person who added/modified the comment*/
				updated_by: { type: SchemaTypes.ObjectId, required: true },
				created_at: { type: SchemaTypes.Number, required: true },
				updated_at: { type: SchemaTypes.Number }
			}
		],
		/*Overall status*/
		osts: {
			js: { type: SchemaTypes.String, required: true },
			emp: { type: SchemaTypes.String, default: null }
		},
		/*Profile matching scores*/
		srs: {
			ttl: { type: SchemaTypes.Number },
			/*Relevance score information stored as JSON stringify*/
			rsrs: { type: SchemaTypes.String }
		},
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitJobPostApplicationSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitJobPostApplication', RecruitJobPostApplicationSchema, 'RecruitJobPostApplications');

export { createRecruitJobPostApplicationSchema, RecruitJobPostApplicationSchema };
