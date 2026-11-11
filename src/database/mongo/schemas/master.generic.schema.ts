import { mongo_ts_opts } from '@app/core/utils/timestamp.utils';
import { Connection, Schema, SchemaTypes } from 'mongoose';

enum MASTER_SCHEMA_GROUP {
	NPRD = 'NPRD' /*Notice period*/,
	EDUN = 'EDUN' /*Education*/,
	GSYS = 'GSYS' /*Grading system*/,
	MAST = 'MAST' /*Marital status*/,
	CTGY = 'CTGY' /*Category*/,
	CRCY = 'CRCY' /*Currency*/,
	PWDT = 'PWDT' /*Pearson with disability type*/,
	REOB = 'REOB' /*Reason for break*/,
	WPUS = 'WPUS' /*Work permit for USA*/,
	EDUM = 'EDUM' /*Education medium*/,
	BAUG = 'BAUG' /*Bachelor(or)Under-Graduation*/,
	MAPG = 'MAPG' /*Masters(or)Post-Graduation*/,
	DPHD = 'DPHD' /*Doctorate(or)PhD*/,
	TMPE = 'TMPE' /*Total Marks In Percentage*/,
	SBCB = 'SBCB' /*School board is central board*/,
	SBSB = 'SBSB' /*School board is state board*/,
	WPOC = 'WPOC' /*Work Permit for Other Countries*/,
	WDIV = 'WDIV' /*Work Diversity*/,
	LNPR = 'LNPR' /*Language Proficiency*/,
	WMODE = 'WMODE' /*Work mode*/,
	EMPT = 'EMPT' /*Employment type*/,
	TTYPE = 'TTYPE' /*Area of concern or Ticket type*/,
	CTUS = 'CTUS' /*Contact us*/,
	ECTUS = 'ECTUS' /*Email details for Contact us*/,
	APPCON = 'APPCON' /*Application settings or configurations*/,
	TCPPD = 'TCPPD' /*Terms and condition,Private policy,Declaration */
}
const MasterGenericSchema = new Schema<any>(
	{
		grp: { type: SchemaTypes.String, required: true, enum: [MASTER_SCHEMA_GROUP] },
		name: { type: SchemaTypes.String, required: true, unique: true },
		desc: { type: SchemaTypes.String, default: null },
		active: { type: SchemaTypes.Boolean, default: true },
		created_at: { type: SchemaTypes.Number },
		updated_at: { type: SchemaTypes.Number }
	},
	{
		...mongo_ts_opts,
		shardKey: {
			grp: 1
		}
	}
);

const createMasterGenericSchema: (conn: Connection) => any = (conn: Connection) =>
	conn.model<any>('MasterGeneric', MasterGenericSchema, 'MasterGenerics');

export { createMasterGenericSchema, MasterGenericSchema, MASTER_SCHEMA_GROUP };
