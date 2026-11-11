import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterDesignationSchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		/*Roles and Responsibilities*/
		rnr: { type: SchemaTypes.Array, default: [] },
		/*Candidate profile*/
		cf: { type: SchemaTypes.Array, default: [] },
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterDesignationSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterDesignation', MasterDesignationSchema, 'MasterDesignations');

export { createMasterDesignationSchema, MasterDesignationSchema };
