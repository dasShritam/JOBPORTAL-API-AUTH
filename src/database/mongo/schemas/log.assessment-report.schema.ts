import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogAssessmentReportSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId, required: true },
		/*Assessment id*/
		asmt_id: { type: SchemaTypes.ObjectId, ref: 'LogAssessmentSchedules', default: null },
		/*Report*/
		rpt: {
			/*When test started*/
			start_ts: { type: SchemaTypes.Number },
			/*When test ended*/
			end_ts: { type: SchemaTypes.Number },
			/*Test summary uri*/
			full_uri: { type: SchemaTypes.String },
			/*Assessment uri*/
			asmt_uri: { type: SchemaTypes.String },
			/*Score*/
			sc: { type: SchemaTypes.Number },
			/*Total percentage*/
			ttl_per: { type: SchemaTypes.Number }
		},
		/*Average score*/
		avg_sc: [
			{
				_id: false,
				name: { type: SchemaTypes.String },
				sc: { type: SchemaTypes.Number }
			}
		],
		visible: { type: SchemaTypes.Boolean, default: false },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogAssessmentReportSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('LogAssessmentReport', LogAssessmentReportSchema, 'LogAssessmentReports');

export { createLogAssessmentReportSchema, LogAssessmentReportSchema };
