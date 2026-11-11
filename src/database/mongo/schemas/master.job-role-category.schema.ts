import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterJobRoleCategorySchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		dept_id: { type: SchemaTypes.ObjectId, required: true, ref: 'MasterDepartment' } /*Department Id*/,
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterJobRoleCategorySchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterJobRoleCategory', MasterJobRoleCategorySchema, 'MasterJobRoleCategories');

export { createMasterJobRoleCategorySchema, MasterJobRoleCategorySchema };
