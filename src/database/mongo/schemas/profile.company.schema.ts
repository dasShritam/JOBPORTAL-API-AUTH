import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const ProfileCompanySchema = new Schema<any>(
	{
		/*Organization profile information*/
		profile: {
			name: { type: SchemaTypes.String, required: true },
			ind: { type: SchemaTypes.String } /*Type of Industry*/,
			alias: { type: SchemaTypes.String, default: null },
			/*Point of contact information*/
			poc: {
				name: { type: SchemaTypes.String, required: true },
				role: { type: SchemaTypes.String, required: true } /* Designation or role of contact person*/,
				ph: {
					/*Primary contact phone number*/
					prim: {
						code: { type: SchemaTypes.String, required: true },
						val: { type: SchemaTypes.String, required: true }
					},
					/*Secondary contact phone number*/
					secd: [
						{
							code: { type: SchemaTypes.String, required: true },
							val: { type: SchemaTypes.String, required: true }
						}
					]
				}
			},
			web: { type: SchemaTypes.String, default: null } /*Website URL*/,
			logo: {
				name: { type: SchemaTypes.String } /*File name with extension*/,
				updated_at: { type: SchemaTypes.Number }
			},
			hvpf: { type: SchemaTypes.String } /*Profile for Hot Vacancies*/,
			clpf: { type: SchemaTypes.String } /*Profile for Classifieds*/,
			fax: { type: SchemaTypes.String },
			tan: { type: SchemaTypes.String },
			adr: {
				street: { type: SchemaTypes.String },
				city: { type: SchemaTypes.String },
				state: { type: SchemaTypes.String },
				country: { type: SchemaTypes.String },
				zip: { type: SchemaTypes.Number }
			}
		},
		settings: {
			/* Number of users limit */
			users: { type: SchemaTypes.Number },
			/*Employer can access jobseeker profiles from date*/
			from: { type: SchemaTypes.Number },
			/*Employer can access jobseeker profiles till date*/
			till: { type: SchemaTypes.Number },
			/* jobseeker profile access count*/
			bl: { type: SchemaTypes.Number }
		},
		tc: { type: SchemaTypes.Boolean, default: false } /*Terms and conditions are accepted*/,
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createProfileCompanySchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('ProfileCompany', ProfileCompanySchema, 'ProfileCompanies');

/*ProfileCompanies*/

export { createProfileCompanySchema, ProfileCompanySchema };
