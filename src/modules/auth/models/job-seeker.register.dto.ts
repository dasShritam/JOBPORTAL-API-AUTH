//#region If email id not found from social media verify email id and register
interface State {
	readonly uniqueid: string;
	readonly ondemandpage: string;
	readonly ip: string;
	readonly agent_type: string;
}

interface VerifyIdentityDto {
	readonly email: string;
	readonly otp: number;
	readonly token: string;
	readonly state: State;
	readonly txn_id: string;
}
//#endregion

export { VerifyIdentityDto };
