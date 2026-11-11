import { mongo_ts_opts, unix_ts_now } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const RecruitJobPostSchema = new Schema<any>(
	{
		/*Company Id*/
		co_id: { type: SchemaTypes.ObjectId, required: true },
		/*Job type => Private job or hot jobs*/
		jt: { type: SchemaTypes.String, required: true },
		/*Job title*/
		title: { type: SchemaTypes.String, required: true },
		/*Employment type*/
		emp_type: { type: SchemaTypes.String, required: true },
		/*Work mode*/
		wm: {
			val: { type: SchemaTypes.String, required: true },
			/*Hybrid policy*/
			plcy: { type: SchemaTypes.String, default: null }
		},
		/*Job description*/
		jd: { type: SchemaTypes.String, required: true },
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
		/*Relocation required*/
		reloc: { type: SchemaTypes.Boolean, default: false },
		/*Industry*/
		ind: { type: SchemaTypes.Array, required: true },
		/*Preferred industry*/
		pref_ind: { type: SchemaTypes.Array, default: [] },
		/*Department*/
		dept: { type: SchemaTypes.String, required: true },
		ctgy: { type: SchemaTypes.String, required: true } /*Role category*/,
		role: { type: SchemaTypes.String, required: true } /*Role*/,
		/*Reference code and It should be unique per employer*/
		alias: { type: SchemaTypes.String },
		/*Number of vaccancies*/
		vacancy: { type: SchemaTypes.Number },
		/*Education*/
		edu: [
			{
				/*BE,B-Tech*/
				course: { type: SchemaTypes.String, required: true },
				/*Specialization*/
				stream: { type: SchemaTypes.Array, default: [] }
			}
		],
		/*Premium colleges*/
		inst: { type: SchemaTypes.Array, default: [] },
		/*Include video profile*/
		siv: { type: SchemaTypes.Boolean, default: false },
		/*Include walk in details (True or false)*/
		wi: {
			/*Start date in unix timestamp*/
			start_ts: { type: SchemaTypes.Number },
			/*End date in unix timestamp*/
			end_ts: { type: SchemaTypes.Number },
			/*Start time - End Time 24hrs format*/
			time: { type: SchemaTypes.String },
			/*Contact information*/
			ci: {
				name: { type: SchemaTypes.String },
				ph: { type: SchemaTypes.String }
			},
			/*Address*/
			adr: { type: SchemaTypes.String },
			/*Location url*/
			loc_uri: { type: SchemaTypes.String }
		},
		diversity: { type: SchemaTypes.Boolean, default: false },
		/*Client information*/
		co: {
			name: { type: SchemaTypes.String },
			adr: { type: SchemaTypes.String }
		},
		/*Display recruiter profile or not*/
		hide_pfl: { type: SchemaTypes.Boolean, default: true },
		notify: {
			/*High match or All*/
			match: { type: SchemaTypes.String, required: true },
			/*Email for notifications*/
			mail: { type: SchemaTypes.Array, default: null },
			/*Frequency of email*/
			freq: { type: SchemaTypes.String, default: null },
			/*Mail subjects fields to include*/
			sub: { type: SchemaTypes.Array, default: null }
		},
		repost: {
			freq: { type: SchemaTypes.String },
			start_ts: { type: SchemaTypes.Number },
			end_ts: { type: SchemaTypes.Number }
		},
		/*Is published or drafted*/
		//draft: { type: SchemaTypes.Boolean, required: true },
		/*Status= Drafted,Published,Closed*/
		status: {
			val: { type: SchemaTypes.String, required: true },
			/*Remarks*/
			rmk: { type: SchemaTypes.String, default: null }
		},
		created_by: { type: SchemaTypes.ObjectId, required: true },
		updated_by: { type: SchemaTypes.ObjectId, default: null },
		created_at: { type: SchemaTypes.Number, default: unix_ts_now() },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

const createRecruitJobPostSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('RecruitJobPost', RecruitJobPostSchema, 'RecruitJobPosts');

export { createRecruitJobPostSchema, RecruitJobPostSchema };
