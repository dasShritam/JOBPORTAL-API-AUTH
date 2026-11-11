import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterCountrySchema = new Schema<any>(
	{
		name: { type: SchemaTypes.String, required: true, unique: true },
		code: { type: SchemaTypes.String, required: true },
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

MasterCountrySchema.index({ created_at: -1 });

const createMasterCountrySchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterCountry', MasterCountrySchema, 'MasterCountries');

export { createMasterCountrySchema, MasterCountrySchema };
