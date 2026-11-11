import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitJobPostInternalSchema = new Schema<any>(
	{
		/*Company Id*/
		co_id: { type: SchemaTypes.ObjectId, required: true },
		/*Job type => Internal job posting or referral job posting*/
		jt: { type: SchemaTypes.String, required: true },
		/*Job title or designation*/
		title: { type: SchemaTypes.String, required: true },
		/*Bonus amount populated in case of referral job posting*/
		bonus: {
			/*Min 1000 max 2lakh*/
			val: { type: SchemaTypes.Number },
			/*Provide bonus terms and conditions if any*/
			plcy: { type: SchemaTypes.String, default: null }
		},
		/*Job description*/
		jd: {
			val: { type: SchemaTypes.String, required: true },
			name: { type: SchemaTypes.String } /*File name with extension if any JD attachments*/
		},
		skills: { type: SchemaTypes.Array, required: true },
		exp: {
			min: { type: SchemaTypes.Number, required: true },
			max: { type: SchemaTypes.Number, required: true }
		},
		ctc: {
			/*Currency*/
			cy: { type: SchemaTypes.String, required: true },
			min: { type: SchemaTypes.Number, required: true },
			max: { type: SchemaTypes.Number, required: true },
			/*Varable pay percentage*/
			varpay: { type: SchemaTypes.Number },
			/*Is visible to jobseekers*/
			hide: { type: SchemaTypes.Boolean, default: true }
		},
		/*Locations*/
		loc: { type: SchemaTypes.Array, required: true },
		/*Department*/
		dept: { type: SchemaTypes.String, required: true },
		ctgy: { type: SchemaTypes.String, required: true } /*Role category*/,
		role: { type: SchemaTypes.String, required: true } /*Role*/,
		/*Reference code/job code and It should be unique per employer*/
		alias: { type: SchemaTypes.String },
		/*Number of vaccancies*/
		vacancy: { type: SchemaTypes.Number, required: true },
		/*Education*/
		edu: [
			{
				/*BE,B-Tech*/
				course: { type: SchemaTypes.String, required: true },
				/*Specialization*/
				stream: { type: SchemaTypes.Array, default: [] }
			}
		],
		/*Target email address (Assigned To) for which employer send an email*/
		asgto: { type: SchemaTypes.Array, required: true },
		/*Start date in unix timestamp*/
		start_ts: { type: SchemaTypes.Number, required: true },
		/*End date in unix timestamp*/
		end_ts: { type: SchemaTypes.Number, required: true },
		/*Recruiter*/
		recr: {
			/*Recruiter name*/
			name: { type: SchemaTypes.String, required: true },
			/*Recruiter contact number*/
			ph: { type: SchemaTypes.String }
		},
		/*Display recruiter profile or not*/
		hide_pfl: { type: SchemaTypes.Boolean, default: true },
		/*Status= Drafted,Published,Closed*/
		status: {
			val: { type: SchemaTypes.String, required: true },
			/*Remarks*/
			rmk: { type: SchemaTypes.String, default: null }
		},
		created_by: { type: SchemaTypes.ObjectId, required: true },
		updated_by: { type: SchemaTypes.ObjectId, default: null },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitJobPostInternalSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitJobPostInternal', RecruitJobPostInternalSchema, 'RecruitJobPostInternals');

export { createRecruitJobPostInternalSchema, RecruitJobPostInternalSchema };
