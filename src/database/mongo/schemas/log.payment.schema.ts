import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

const LogPaymentSchema = new Schema<any>(
	{
		/*Assessment id*/
		asmt_id: { type: SchemaTypes.ObjectId, ref: 'LogAssessmentSchedules', default: null },
		/*User Id*/
		user_id: { type: SchemaTypes.ObjectId, required: true },
		/*Invoice id*/
		inv_id: { type: SchemaTypes.String, required: true },
		/*Order Id*/
		ord_id: { type: SchemaTypes.String, required: true },
		/*Transaction Id*/
		txn_id: { type: SchemaTypes.String, default: null },
		/*Payment signature to confirm payment completed successfully*/
		sign: { type: SchemaTypes.String, default: null },
		/*Status will be CREATED, CAPTURED, FAILED OR CANCELLED*/
		status: { type: SchemaTypes.String, required: true },
		/*Amount paid by user*/
		amt: {
			cy: { type: SchemaTypes.String, required: true } /*Currency- Rupees or USD*/,
			val: { type: SchemaTypes.Number, required: true } /*Value*/
		},
		/*Remarks by user on payment*/
		rmk: { type: SchemaTypes.String, default: null },
		/*Error message on payment failure*/
		err: { type: SchemaTypes.String, default: null },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	mongo_ts_opts
);

const createLogPaymentSchema: (conn: Connection) => any = (conn: Connection) => conn.model<any>('LogPayment', LogPaymentSchema, 'LogPayments');

export { createLogPaymentSchema, LogPaymentSchema };
