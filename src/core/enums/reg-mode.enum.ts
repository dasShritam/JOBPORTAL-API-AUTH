enum RegMode {
	CREDENTIALS = 'CREDENTIALS',
	GOOGLE = 'GOOGLE',
	LINKEDIN = 'LINKEDIN',
	FACEBOOK = 'FACEBOOK',
	TWITTER = 'TWITTER'
}

class RegModeGroup {
	static readonly ALL_REGMODE: RegMode[] = [RegMode.CREDENTIALS, RegMode.GOOGLE, RegMode.LINKEDIN, RegMode.FACEBOOK, RegMode.TWITTER];
	static readonly CREDENTIALS: RegMode[] = [RegMode.CREDENTIALS];
	static readonly SOCIAL_MEDIA: RegMode[] = [RegMode.FACEBOOK, RegMode.GOOGLE, RegMode.LINKEDIN, RegMode.TWITTER];
}

export { RegMode, RegModeGroup };
