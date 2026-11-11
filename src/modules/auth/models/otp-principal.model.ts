import { Types } from 'mongoose';

interface State {
	readonly uniqueid: string;
	readonly ondemandpage: string;
	readonly agent_type: string;
	readonly ip: string;
}
interface sendOtpPrincipal {
	readonly code: string;
	readonly commInfo: string;
	readonly channel: string;
	readonly oid?: Types.ObjectId;
}
interface otpSignIn {
	readonly code: string;
	readonly phNo: string;
	readonly ip: string;
	readonly role?: string;
}

interface verifyAndCreateTokenPrincipal {
	readonly txn_id: string;
	readonly otp: string;
	readonly state: State;
}
interface verifyOtpPrincipal {
	readonly to: string;
	readonly txn_id: string;
	readonly otp: string;
	readonly channel: string;
}

interface forgetPwdVerificationPrincipal {
	readonly to: string;
	readonly txn_id: string;
	readonly ip: string;
	readonly otp: string;
	readonly authType: string;
	readonly userId: string;
}

interface SendOtpDto {
	readonly ip: string;
	readonly to: string;
	readonly user_id?: string;
	readonly channel: string;
}

export { sendOtpPrincipal, verifyAndCreateTokenPrincipal, otpSignIn, verifyOtpPrincipal, forgetPwdVerificationPrincipal, SendOtpDto };
