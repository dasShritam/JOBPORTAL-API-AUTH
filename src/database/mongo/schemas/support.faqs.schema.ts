import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const SupportFaqSchema = new Schema<any>(
	{
		qn: { type: SchemaTypes.String, required: true },
		ans: { type: SchemaTypes.String, required: true },
		ctgy: { type: SchemaTypes.String, default: null },
		tags: { type: SchemaTypes.Array, default: [] },
		/*Up vote*/
		upvt: { type: SchemaTypes.Number },
		/*Down vote*/
		dnvt: { type: SchemaTypes.Number },
		active: { type: SchemaTypes.Boolean },
		created_by: { type: SchemaTypes.ObjectId, required: true },
		updated_by: { type: SchemaTypes.ObjectId },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createSupportFaqSchema: (conn: Connection) => any = (conn: Connection) => conn.model<any>('SupportFaq', SupportFaqSchema, 'SupportFaqs');

export { createSupportFaqSchema, SupportFaqSchema };
