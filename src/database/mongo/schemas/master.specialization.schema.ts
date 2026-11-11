import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterSpecializationSchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		strm_id: { type: SchemaTypes.ObjectId, required: true, ref: 'MasterGenerics' } /*Stream id*/,
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterSpecializationSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterSpecialization', MasterSpecializationSchema, 'MasterSpecializations');

export { createMasterSpecializationSchema, MasterSpecializationSchema };
