import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const ProfileJobSeekerPrivateSchema = new Schema<any>(
	{
		/*Id referencing user profile employer*/
		co_id: { type: SchemaTypes.ObjectId, required: true },
		name: { type: SchemaTypes.String },
		mail: { type: SchemaTypes.Array, default: [] },
		ph: { type: SchemaTypes.Array, default: [] },
		cv: {
			name: { type: SchemaTypes.String },
			updated_at: { type: SchemaTypes.Number }
		},
		tags: { type: SchemaTypes.Array, default: [] },
		cv_text: { type: SchemaTypes.String, required: true },
		/*List of it/key skills*/
		skills: { type: SchemaTypes.Array, default: [] },
		/*Tags used as search index*/
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);
const createProfileJobSeekerPrivateSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('ProfileJobSeekerPrivate', ProfileJobSeekerPrivateSchema, 'ProfileJobSeekerPrivate');

export { createProfileJobSeekerPrivateSchema, ProfileJobSeekerPrivateSchema };
