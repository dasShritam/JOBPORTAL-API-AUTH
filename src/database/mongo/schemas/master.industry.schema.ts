import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterIndustrySchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterIndustrySchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterIndustry', MasterIndustrySchema, 'MasterIndustries');

export { createMasterIndustrySchema, MasterIndustrySchema };
