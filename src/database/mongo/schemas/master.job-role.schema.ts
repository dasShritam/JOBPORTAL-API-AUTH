import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterJobRoleSchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		ctgy_id: { type: SchemaTypes.ObjectId, required: true, ref: 'MasterJobRoleCategory' } /*Job role category id*/,
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterJobRoleSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterJobRole', MasterJobRoleSchema, 'MasterJobRoles');

export { createMasterJobRoleSchema, MasterJobRoleSchema };
