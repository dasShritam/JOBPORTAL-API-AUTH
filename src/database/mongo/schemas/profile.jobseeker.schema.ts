import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';
const ProfileJobSeekerSchema = new Schema<any>(
	{
		/*Id referencing user accounts schema*/
		user_id: { type: SchemaTypes.ObjectId, unique: true, required: true },
		profile: {
			name: { type: SchemaTypes.String, required: true },
			gender: { type: SchemaTypes.String },
			dob_ts: { type: SchemaTypes.Number, default: null } /*DOB in timestamp*/,
			marsta: { type: SchemaTypes.String, default: null } /*Marital status*/,
			/*Profile image*/
			img: {
				name: { type: SchemaTypes.String } /*File name with extension*/,
				updated_at: { type: SchemaTypes.Number }
			},
			/*Self introduction video*/
			siv: {
				name: { type: SchemaTypes.String } /*File name with extension*/,
				updated_at: { type: SchemaTypes.Number }
			},

			adr: [
				/*Address*/
				{
					street: { type: SchemaTypes.String },
					city: { type: SchemaTypes.String },
					state: { type: SchemaTypes.String },
					country: { type: SchemaTypes.String },
					zip: { type: SchemaTypes.Number }
				}
			],
			ctgy: { type: SchemaTypes.String, default: null }, //Category => OBC or SC/ST
			pwd_type: { type: SchemaTypes.String, default: null } /*People with disability type*/,
			asst: { type: SchemaTypes.String, default: null } /*Assistance*/,
			/*Contacts*/
			ci: [
				{
					_id: false,
					ccode: { type: SchemaTypes.String } /*Country code*/,
					acode: { type: SchemaTypes.String } /*Area code*/,
					ph: { type: SchemaTypes.String }
				}
			],
			/*Current location*/
			loc: {
				city: { type: SchemaTypes.String },
				state: { type: SchemaTypes.String },
				country: { type: SchemaTypes.String }
			}
		},
		/*Languages*/
		lang: [
			{
				name: { type: SchemaTypes.String },
				ability: { type: SchemaTypes.Array },
				level: { type: SchemaTypes.String } //Expert or Proficient or Beginner
			}
		],
		skills: {
			key: { type: SchemaTypes.Array, default: [] },
			it: [
				{
					name: { type: SchemaTypes.String },
					ver: { type: SchemaTypes.String } /*Version*/,
					exp: {
						mos: { type: SchemaTypes.Number } /*Months*/,
						yr: { type: SchemaTypes.Number } /*Year*/
					},
					last_ts: { type: SchemaTypes.Number } /*Last used*/
				}
			]
		},

		emp: [
			/*Employments*/
			{
				//emp_type: { type: SchemaTypes.String } /*Full time or Internship*/,

				/*Common for both full time or internship*/
				co: { type: SchemaTypes.String } /*Company*/,
				start_ts: { type: SchemaTypes.Number } /*Joining date*/,
				/*Is current employment decided based on end_ts property*/
				end_ts: { type: SchemaTypes.Number, default: null } /*Worked till*/,
				ctc: {
					cy: { type: SchemaTypes.String } /*Currency*/,
					val: { type: SchemaTypes.Number } /*Value*/
				},
				/*Full time*/
				ft: {
					role: { type: SchemaTypes.String } /*Current designation or role*/,
					jd: { type: SchemaTypes.String } /*Job description as Job profile*/,
					/*Value comes when full time with current employment*/
					skill: { type: SchemaTypes.Array, default: [] } /*Value comes when full time with current employment*/,
					/*Notice period*/
					np: {
						term: { type: SchemaTypes.String },
						role: { type: SchemaTypes.String } /*Offered designation*/,
						co: { type: SchemaTypes.String } /*Next employer*/,
						/*Offered CTC*/
						octc: {
							cy: { type: SchemaTypes.String } /*Currency*/,
							val: { type: SchemaTypes.Number }
						},
						end_ts: { type: SchemaTypes.Number, default: null } /*Expected last working day*/
					}
				},
				/*Internship*/
				intern: {
					loc: { type: SchemaTypes.String } /*Location*/,
					dept: { type: SchemaTypes.String } /*Department*/,
					ctgy: { type: SchemaTypes.String } /*Category*/,
					role: { type: SchemaTypes.String } /*Role*/,
					proj: {
						desc: { type: SchemaTypes.String },
						uri: { type: SchemaTypes.String }
					}
				}
			}
		],

		edu: {
			/*Schools*/
			sch: [
				{
					course: { type: SchemaTypes.String },
					medium: { type: SchemaTypes.String },
					board: { type: SchemaTypes.String },
					eng: { type: SchemaTypes.Number } /*English marks*/,
					math: { type: SchemaTypes.Number } /*Math marks*/,
					grade: { type: SchemaTypes.String },
					marks: { type: SchemaTypes.String },
					yr: { type: SchemaTypes.Number } /*Completion year*/
				}
			],
			degree: [
				{
					level: { type: SchemaTypes.String } /*Education type Masters/Post-Graduation or PHD*/,
					inst: { type: SchemaTypes.String } /*Institute*/,
					course: { type: SchemaTypes.String } /*BE,B-Tech*/,
					ctype: { type: SchemaTypes.String } /*Course typeFull time or part time*/,
					stream: { type: SchemaTypes.String },
					grade: { type: SchemaTypes.String },
					marks: { type: SchemaTypes.String },
					start_ts: { type: SchemaTypes.Number } /*Start year*/,
					end_ts: { type: SchemaTypes.Number } /*Completion year*/
				}
			]
		},

		proj: [
			{
				title: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String },
				co: { type: SchemaTypes.String } /*Client*/,
				loc: { type: SchemaTypes.String } /*Location*/,
				skill: { type: SchemaTypes.Array, default: [] } /*Skills*/,
				/* Role or designation */
				role: {
					name: { type: SchemaTypes.String },
					desc: { type: SchemaTypes.String }
				},
				emp_type: { type: SchemaTypes.String } /*Employment type*/,
				team_size: { type: SchemaTypes.Number },
				on_site: { type: SchemaTypes.Boolean, required: false },
				edu_id: { type: SchemaTypes.ObjectId, default: null } /*References edu _id*/,
				start_ts: { type: SchemaTypes.Number },
				end_ts: { type: SchemaTypes.Number, default: null }
			}
		],
		/*Social profile or networks*/
		soc_net: [
			{
				name: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String, default: null },
				uri: { type: SchemaTypes.String }
			}
		],
		/*Online ppt*/
		ppt: [
			{
				title: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String, default: null },
				uri: { type: SchemaTypes.String }
			}
		],
		/*Work sample*/
		ws: [
			{
				title: { type: SchemaTypes.String },
				uri: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String, default: null },
				start_ts: { type: SchemaTypes.Number },
				end_ts: { type: SchemaTypes.Number, default: null }
			}
		],
		/*Publication*/
		publ: [
			{
				title: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String, default: null },
				uri: { type: SchemaTypes.String },
				publ_ts: { type: SchemaTypes.Number }
			}
		],

		patent: [
			{
				ano: { type: SchemaTypes.String } /*Application number*/,
				title: { type: SchemaTypes.String },
				desc: { type: SchemaTypes.String, default: null },
				uri: { type: SchemaTypes.String },
				status: { type: SchemaTypes.String } /*Issued or Pending*/,
				ofc: { type: SchemaTypes.String } /*Patent office*/,
				publ_ts: { type: SchemaTypes.Number } /*Published on*/,
				iss_ts: { type: SchemaTypes.Number }
			}
		],

		cert: [
			{
				name: { type: SchemaTypes.String },
				cid: { type: SchemaTypes.String, default: null } /*Certification id*/,
				iss_by: { type: SchemaTypes.String } /*Issued by*/,
				yr: { type: SchemaTypes.Number } /*Completion year*/,
				uri: { type: SchemaTypes.String },
				iss_ts: { type: SchemaTypes.Number },
				exp_ts: { type: SchemaTypes.Number }
			}
		],

		cp: {
			/*Required */
			fresher: { type: SchemaTypes.Boolean, default: null },
			cv: {
				name: { type: SchemaTypes.String },
				updated_at: { type: SchemaTypes.Number }
			},
			title: { type: SchemaTypes.String, default: null } /*Headline*/,
			smry: { type: SchemaTypes.String, default: null } /*Summary*/,

			/*Total experience, Removed fresher property and calculated based on exp property*/
			exp: {
				mos: { type: SchemaTypes.Number } /*Months*/,
				yr: { type: SchemaTypes.Number } /*Year*/,
				/*Current ctc*/
				cctc: {
					cy: { type: SchemaTypes.String } /*Currency*/,
					val: { type: SchemaTypes.Number }
				}
			},

			/*Career break and populated when job seeker on career break*/
			cb: {
				reason: { type: SchemaTypes.String },
				from_ts: { type: SchemaTypes.Number },
				till_ts: { type: SchemaTypes.Number }
			},

			/*Career profile*/
			sect: { type: SchemaTypes.String } /*Industry or sector*/,
			dept: { type: SchemaTypes.String } /*Department*/,
			ctgy: { type: SchemaTypes.String } /*Category*/,
			role: { type: SchemaTypes.String } /*Job role*/,
			job_type: { type: SchemaTypes.Array, default: [] } /*Job type*/,
			emp_type: { type: SchemaTypes.Array, default: [] } /*Employment type*/,
			shift: { type: SchemaTypes.String },
			loc: { type: SchemaTypes.Array, default: [] } /*Preferred location*/,
			/*Expected CTC*/
			ectc: {
				cy: { type: SchemaTypes.String } /*Currency*/,
				val: { type: SchemaTypes.Number }
			},
			/*Work diversity which is more information in Naukri Personal Details*/
			wd: { type: SchemaTypes.Array, default: [] } /*Single parent, Working Mother etc...*/,
			wp: { type: SchemaTypes.String } /*Work permit*/,
			wpoc: { type: SchemaTypes.Array, default: [] } /*Work permit outside india*/,
			avail: { type: SchemaTypes.String, default: null } /*Availability to join*/

			// /*Offered CTC and it is populated when job seeker has any offer*/
			// octc: {
			// 	cy: { type: SchemaTypes.String } /*Currency*/,
			// 	val: { type: SchemaTypes.Number }
			// }
		},
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);
const createProfileJobSeekerSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('ProfileJobSeeker', ProfileJobSeekerSchema, 'ProfileJobSeekers');
export { createProfileJobSeekerSchema, ProfileJobSeekerSchema };
