interface State {
	readonly caller: string;
	readonly uniqueid: string;
	readonly ondemandpage: string;
	readonly agent_type: string;
	readonly ip: string;
	readonly redirect_uri: string;
	readonly code_verifier?: string;
}

interface AccessTokenPrincipal {
	requestee: string[];
	readonly authType: string;
	readonly authKey: string;
	pwd: string;
	readonly state: State;
}

interface RefreshTokenPrincipal {
	readonly refreshToken?: string;
	readonly state: State;
}

export { State, AccessTokenPrincipal, RefreshTokenPrincipal };
