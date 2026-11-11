import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogAssessmentScheduleSchema = new Schema<any>(
	{
		user_id: { type: SchemaTypes.ObjectId, required: true },
		/*Email id for which invitation sent*/
		mail: { type: SchemaTypes.String, required: true },
		/*Person name*/
		name: { type: SchemaTypes.String, required: true },
		/*Hacker earth test id*/
		test_id: { type: SchemaTypes.String, required: true },
		/*Test invitation information*/
		invt: {
			uri: { type: SchemaTypes.String },
			start_ts: { type: SchemaTypes.Number },
			end_ts: { type: SchemaTypes.Number }
		},
		/*Status will be INITIATED, FAILED, CANCELLED, INVITED, STARTED, COMPLETED*/
		status: { type: SchemaTypes.String, required: true },
		mail_sent: { type: SchemaTypes.Boolean, default: false },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogAssessmentScheduleSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('LogAssessmentSchedule', LogAssessmentScheduleSchema, 'LogAssessmentSchedules');

export { createLogAssessmentScheduleSchema, LogAssessmentScheduleSchema };
