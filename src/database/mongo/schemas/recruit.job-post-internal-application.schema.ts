import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitJobPostInternalApplicationSchema = new Schema<any>(
	{
		co_id: { type: SchemaTypes.ObjectId, required: true },
		jobid: { type: SchemaTypes.ObjectId, required: true },
		/*Employee id*/
		emp_id: { type: SchemaTypes.String },
		/*Name of the applicant*/
		name: { type: SchemaTypes.String, required: true },
		/*User official email address*/
		mail: { type: SchemaTypes.String, required: true },
		/*Current role*/
		role: { type: SchemaTypes.String, required: true },
		/*Current location*/
		loc: { type: SchemaTypes.String, required: true },
		/*Relocation assistance required*/
		reloc_asst: { type: SchemaTypes.Boolean, default: false },
		/*Expected CTC*/
		ectc: {
			/*Currency*/
			cy: { type: SchemaTypes.String, required: true },
			val: { type: SchemaTypes.Number, required: true }
		},
		/*Skills*/
		skills: { type: SchemaTypes.Array, required: true },
		/*Provide ecperience in months*/
		exp: { type: SchemaTypes.Number, required: true },
		/*Education*/
		edu: [
			{
				/*BE,B-Tech*/
				course: { type: SchemaTypes.String, required: true },
				/*Specialization*/
				stream: { type: SchemaTypes.Array, default: [] }
			}
		],
		/*List of certifications*/
		cert: { type: SchemaTypes.Array },
		/*Joining date*/
		jng_ts: { type: SchemaTypes.Number, required: true },
		/*Latest updated resume*/
		cv: {
			name: { type: SchemaTypes.String, required: true },
			updated_at: { type: SchemaTypes.Number, required: true }
		},
		/*Reason for apply*/
		reason: { type: SchemaTypes.String, required: true },
		/*Referrer information. Mandatory when user applying for referrel job*/
		ref: {
			name: { type: SchemaTypes.String },
			emp_id: { type: SchemaTypes.String }
		},
		/*Overall status*/
		osts: {
			js: { type: SchemaTypes.String, required: true },
			emp: { type: SchemaTypes.String, default: null }
		},
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitJobPostInternalApplicationSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitJobPostInternalApplication', RecruitJobPostInternalApplicationSchema, 'RecruitJobPostInternalApplications');

export { createRecruitJobPostInternalApplicationSchema, RecruitJobPostInternalApplicationSchema };
