import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SecurityUserAccountSchema = new Schema<any>(
	{
		uname: { type: SchemaTypes.String, required: true, unique: true },
		name: { type: SchemaTypes.String, required: true },
		/*Contact information*/
		ci: {
			/*Primary or secondary contact information*/
			prim: {
				ph: {
					code: { type: SchemaTypes.String },
					val: { type: SchemaTypes.String },
					/*Is verified*/
					iv: { type: SchemaTypes.Boolean, default: false }
				},
				mail: {
					val: { type: SchemaTypes.String },
					/*Is verified*/
					iv: { type: SchemaTypes.Boolean, default: false }
				}
			},
			secd: [
				{
					_id: false,
					code: { type: SchemaTypes.String },
					ph: { type: SchemaTypes.String },
					mail: { type: SchemaTypes.String }
				}
			]
		},
		/*Social network*/
		soc_net: [
			{
				_id: false,
				id: { type: SchemaTypes.String },
				name: { type: SchemaTypes.String },
				created_at: { type: SchemaTypes.Number }
			}
		],
		pwd: [
			/*Password*/
			{
				hash: { type: SchemaTypes.String },
				created_at: { type: SchemaTypes.Number },
				active: { type: SchemaTypes.Boolean, default: true }
			}
		],
		role: { type: SchemaTypes.String, required: true } /*Jobseeker,Employer or Admin*/,
		reg_mode: { type: SchemaTypes.String, required: true } /*Credentials or Google or Twitter or Linked In or Facebook*/,
		/*Permissions-> what all are features are available to this user*/
		prm: { type: SchemaTypes.Array, default: [] },
		login_enabled: { type: SchemaTypes.Boolean, default: true },
		active: { type: SchemaTypes.Boolean, default: true },
		/*Email subscription*/
		mail_sub:{type:SchemaTypes.Boolean,default:false},
		created_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{ ...mongo_ts_opts }
);

/*

*/

SecurityUserAccountSchema.index({ uname: 'hashed' });

const createSecurityUserAccountSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('SecurityUserAccount', SecurityUserAccountSchema, 'SecurityUserAccounts');

export { createSecurityUserAccountSchema, SecurityUserAccountSchema };
