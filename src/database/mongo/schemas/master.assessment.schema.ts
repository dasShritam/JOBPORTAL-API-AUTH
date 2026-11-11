import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const MasterAssessmentSchema = new Schema<any>(
	{
		test_id: { type: SchemaTypes.String, required: true, unique: true },
		name: { type: SchemaTypes.String, required: true, unique: true },
		desc: { type: SchemaTypes.String, required: true },
		fee: {
			cy: { type: SchemaTypes.String, required: true } /*Currency- Rupees or USD*/,
			val: { type: SchemaTypes.Number, required: true } /*Value*/,
			reval: { type: SchemaTypes.Number, required: true } /*Retake test amount*/
		},
		/*Test category which comes from master*/
		ctgy: { type: SchemaTypes.String, required: true },
		/*Duration*/
		dur: { type: SchemaTypes.Number, required: true },
		/*Skills*/
		skill: { type: SchemaTypes.Array, default: [] },
		/*Question weightage*/
		qn_wgt: [
			{
				_id: false,
				/*Name of the question category*/
				name: { type: SchemaTypes.String, required: true },
				/*Score*/
				sc: { type: SchemaTypes.Number, required: true },
				/*Total question*/
				ttl_qn: { type: SchemaTypes.Number, required: true }
			}
		],
		/*Total score*/
		ttl_sc: { type: SchemaTypes.Number, required: true },
		/*Total questions*/
		ttl_qn: { type: SchemaTypes.Number, required: true },
		/*Cut-off score*/
		cto: { type: SchemaTypes.Number, default: null },
		/*Practice test uri*/
		test_uri: { type: SchemaTypes.String, required: true },
		/*Assessment start date*/
		start_ts: { type: SchemaTypes.Number, required: true },
		/*Assessment end date*/
		end_ts: { type: SchemaTypes.Number, default: null },
		/* Assessment Retake Attempt count*/
		re_atmpt: { type: SchemaTypes.Number, required: true, max: 10 },

		active: { type: SchemaTypes.Boolean, default: true },
		created_by: { type: SchemaTypes.ObjectId, required: true },
		updated_by: { type: SchemaTypes.ObjectId, default: null },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createMasterAssessmentSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterAssessment', MasterAssessmentSchema, 'MasterAssessments');

export { createMasterAssessmentSchema, MasterAssessmentSchema };
