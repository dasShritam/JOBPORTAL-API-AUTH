import { ObjectId } from 'mongoose';

export interface ProfileJobSeekerModel {
	/*Id referencing user accounts schema*/
	user_id?: ObjectId;
	profile?: {
		name?: string;
		gender?: string;
		dob_ts?: number /*DOB in timestamp*/;
		marsta?: string /*Marital status*/;
		/*Profile image*/
		img?: {
			name?: string /*File name with extension*/;
			updated_at?: number;
		};
		/*Self introduction video*/
		siv?: {
			name?: string /*File name with extension*/;
			updated_at?: number;
		};

		adr?: [
			/*Address*/
			{
				street?: string;
				city?: string;
				state?: string;
				country?: string;
				zip?: number;
			}
		];
		ctgy?: string; //Category => OBC or SC/ST
		pwd_type?: string /*People with disability type*/;
		/*Contacts*/
		ci?: [
			{
				_id?: false;
				ccode?: string /*Country code*/;
				acode?: string /*Area code*/;
				ph?: string;
			}
		];
		/*Current location*/
		loc?: {
			city?: string;
			state?: string;
			country?: string;
		};
	};
	/*Languages*/
	lang?: [
		{
			name?: string;
			ability?: string[];
			level?: string; //Expert or Proficient or Beginner
		}
	];
	skills?: {
		key?: string[];
		it?: [
			{
				name?: string;
				ver?: string /*Version*/;
				exp?: {
					mos?: number /*Months*/;
					ys?: number /*Year*/;
				};
				last_ts?: number /*Last used*/;
			}
		];
	};
	emp?: [
		/*Employments*/
		{
			//emp_type?: string, /*Full time or Internship*/,

			/*Common for both full time or internship*/
			co?: string /*Company*/;
			start_ts?: number /*Joining date*/;
			/*Is current employment decided based on end_ts property*/
			end_ts?: number /*Worked till*/;
			ctc?: {
				cy?: string /*Currency*/;
				val?: number /*Value*/;
			};
			/*Full time*/
			ft?: {
				role?: string /*Current designation or role*/;
				jd?: string /*Job description as Job profile*/;
				/*Value comes when full time with current employment*/
				skill?: string[] /*Value comes when full time with current employment*/;
				/*Notice period*/
				np?: {
					term?: string;
					role?: string /*Offered designation*/;
					co?: string /*Next employer*/;
					/*Offered CTC*/
					octc?: {
						cy?: string /*Currency*/;
						val?: number;
					};
					end_ts?: number /*Expected last working day*/;
				};
			};
			/*Internship*/
			intern?: {
				loc?: string /*Location*/;
				dept?: string /*Department*/;
				ctgy?: string /*Category*/;
				role?: string /*Role*/;
				proj?: {
					desc?: string;
					uri?: string;
				};
			};
		}
	];

	edu?: {
		/*Schools*/
		sch?: [
			{
				course?: string;
				medium?: string;
				board?: string;
				eng?: number /*English marks*/;
				math?: number /*Math marks*/;
				grade?: string;
				marks?: string;
				yr?: number /*Completion year*/;
			}
		];
		degree?: [
			{
				level?: string /*Education type Masters/Post-Graduation or PHD*/;
				inst?: string /*Institute*/;
				course?: string /*BE,B-Tech*/;
				ctype?: string /*Course typeFull time or part time*/;
				stream?: string;
				grade?: string;
				marks?: string;
				start_ts?: number /*Start year*/;
				end_ts?: number /*Completion year*/;
			}
		];
	};

	proj?: [
		{
			title?: string;
			desc?: string;
			co?: string /*Client*/;
			loc?: string /*Location*/;
			skill?: string[] /*Skills*/;
			/* Role or designation */
			role?: {
				name?: string;
				desc?: string;
			};
			emp_type?: string /*Employment type*/;
			team_size?: number;
			on_site?: boolean;
			edu_id?: ObjectId /*References edu _id*/;
			start_ts?: number;
			end_ts?: number;
		}
	];
	/*Social profile or networks*/
	soc_net?: [
		{
			name?: string;
			desc?: string;
			uri?: string;
		}
	];
	/*Online ppt*/
	ppt?: [
		{
			title?: string;
			desc?: string;
			uri?: string;
		}
	];
	/*Work sample*/
	ws?: [
		{
			title?: string;
			uri?: string;
			desc?: string;
			start_ts?: number;
			end_ts?: number;
		}
	];
	/*Publication*/
	publ?: [
		{
			title?: string;
			desc?: string;
			uri?: string;
			publ_ts?: number;
		}
	];

	patent?: [
		{
			ano?: string /*Application number*/;
			title?: string;
			desc?: string;
			uri?: string;
			status?: string /*Issued or Pending*/;
			ofc?: string /*Patent office*/;
			publ_ts?: number /*Published on*/;
			iss_ts?: number;
		}
	];

	cert?: [
		{
			name?: string;
			cid?: string /*Certification id*/;
			iss_by?: string /*Issued by*/;
			yr?: number /*Completion year*/;
			uri?: string;
			iss_ts?: number;
			exp_ts?: number;
		}
	];

	cp?: {
		/*Required */
		fresher?: boolean;
		cv?: {
			name?: string;
			updated_at?: number;
		};
		title?: string /*Headline*/;
		smry?: string /*Summary*/;

		/*Total experience, Removed fresher property and calculated based on exp property*/
		exp?: {
			mos?: number /*Months*/;
			yr?: number /*Year*/;
			/*Current ctc*/
			cctc?: {
				cy?: string /*Currency*/;
				val?: number;
			};
		};

		/*Career break and populated when job seeker on career break*/
		cb?: {
			reason?: string;
			from_ts?: number;
			till_ts?: number;
		};

		/*Career profile*/
		sect?: string /*Industry or sector*/;
		dept?: string /*Department*/;
		ctgy?: string /*Category*/;
		role?: string /*Job role*/;
		job_type?: string[] /*Job type*/;
		emp_type?: string[] /*Employment type*/;
		shift?: string;
		loc?: string[] /*Preferred location*/;
		/*Expected CTC*/
		ectc?: {
			cy?: string /*Currency*/;
			val?: number;
		};
		/*Work diversity which is more information in Naukri Personal Details*/
		wd?: string[] /*Single parent, Working Mother etc...*/;
		wp?: string /*Work permit*/;
		wpoc?: string[] /*Work permit outside india*/;
		avail?: string /*Availability to join*/;

		// /*Offered CTC and it is populated when job seeker has any offer*/
		// octc?: {
		// 	cy?: string, /*Currency*/
		// 	val?: number
		// }
	};
	created_at?: number;
	updated_at?: number;
}
