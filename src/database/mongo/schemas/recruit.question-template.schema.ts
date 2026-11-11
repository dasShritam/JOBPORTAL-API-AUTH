import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitQuestionTemplateSchema = new Schema<any>(
	{
		co_id: { type: SchemaTypes.ObjectId, required: true },
		name: { type: SchemaTypes.String, required: true },
		qn: [
			{
				/*Questions to ask*/
				name: { type: SchemaTypes.String, required: true },
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
				req: { type: SchemaTypes.Boolean, default: false }
			}
		],
		created_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitQuestionTemplateSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitQuestionTemplate', RecruitQuestionTemplateSchema, 'RecruitQuestionTemplates');

export { createRecruitQuestionTemplateSchema, RecruitQuestionTemplateSchema };
