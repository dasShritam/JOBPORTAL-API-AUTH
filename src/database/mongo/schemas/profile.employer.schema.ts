import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const ProfileEmployerSchema = new Schema<any>(
	{
		/*Employer name*/
		user_id: { type: SchemaTypes.ObjectId, required: true, unique: true },
		co_id: { type: SchemaTypes.ObjectId, required: true },
		name: { type: SchemaTypes.String, required: true },
		/*Profile image*/
		img: {
			name: { type: SchemaTypes.String } /*File name with extension*/,
			updated_at: { type: SchemaTypes.Number }
		},
		/*Designation of user in the company*/
		role: { type: SchemaTypes.String },
		/*Reporting manage id*/
		// rmid: { type: SchemaTypes.ObjectId },
		/*Address*/
		adr: {
			street: { type: SchemaTypes.String },
			city: { type: SchemaTypes.String },
			state: { type: SchemaTypes.String },
			country: { type: SchemaTypes.String },
			zip: { type: SchemaTypes.Number }
		},
		/*Permissions*/
		prm: { type: SchemaTypes.Array, default: [] },
		/*Accessibility i.e a11y*/
		a11y: {
			from: { type: SchemaTypes.Number },
			till: { type: SchemaTypes.Number },
			days: {
				type: SchemaTypes.Array
			} /*To restrict access to the resource on weekends, you can set accessible_days to [0, 6], which will allow access on all days except Sunday and Saturday. 0-Sunday, 1-Monday, ....6-Saturday*/
		},
		created_by: { type: SchemaTypes.ObjectId, required: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createProfileEmployerSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('ProfileEmployer', ProfileEmployerSchema, 'ProfileEmployers');

export { createProfileEmployerSchema, ProfileEmployerSchema };
