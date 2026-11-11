export class AppConfigService {
	private readonly envConfig: { [key: string]: any } = {};
	constructor() {
		/*App configurations*/
		this.envConfig.app = {
			port: parseInt(process.env.AUTH_SVC_PORT, 10),
			environment: process.env.ENVIRONMENT,
			sa_uri: process.env.STORAGE_ACC_URI
		};

		/*Database*/
		this.envConfig.db = {
			mongo: {
				uri: process.env.APP_CONNECTIONSTRING_MONGO
			}
		};

		/*blob configuration*/
		this.envConfig.blobStorage = {
			blobAccountName: process.env.BLOB_AC_NAME,
			blobAccountKey: process.env.BLOB_AC_KEY,
			blobAccountConnectionString: process.env.BLOB_CONNECTION_STRING,
			blobLoggerContainer: process.env.BLOB_LOGGER_CONTAINER,
			blobCommonContainer: process.env.BLOB_COMMON_CONTAINER,
			blobEmployerContainer: process.env.BLOB_EMPLOYER_CONTAINER,
			blobJobSeekerContainer: process.env.BLOB_JOBSEEKER_CONTAINER
		};

		/*Logger*/
		this.envConfig.logger = {
			logLevel: process.env.LOG_LEVEL
		};

		/*Application secretes & token settings*/
		this.envConfig.tokenMetadata = {
			appAtSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
			appTempAtSecret: process.env.JWT_TEMP_ACCESS_TOKEN_SECRET,
			appRtSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
			web: {
				at: {
					expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_TIMEMIN_WEB
				},
				tempAt: {
					expiresIn: process.env.JWT_TEMP_ACCESS_TOKEN_EXP_TIMEMIN_WEB
				},
				rt: {
					expiresIn: process.env.JWT_REFRESH_TOKEN_EXP_TIMEMIN_WEB,
					maxTtl: process.env.JWT_REFRESH_TOKEN_TTL_DAY_WEB
				}
			}
		};

		/*Social media settings */
		this.envConfig.authSso = {
			google: {
				clientId: process.env.GOOGLE_SSO_CLIENT_ID,
				clientSecret: process.env.GOOGLE_SSO_CLIENT_SECRET
			},
			linkedIn: {
				clientId: process.env.LINKEDIN_SSO_CLIENT_ID,
				clientSecret: process.env.LINKEDIN_SSO_CLIENT_SECRET
			},
			facebook: {
				clientId: process.env.FACEBOOK_SSO_CLIENT_ID,
				clientSecret: process.env.FACEBOOK_SSO_CLIENT_SECRET
			},
			twitter: {
				clientId: process.env.TWITTER_SSO_CLIENT_ID,
				clientSecret: process.env.TWITTER_SSO_CLIENT_SECRET
			}
		};

		/*Text local and OTP validity*/
		this.envConfig.otpSvc = {
			apiKey: process.env.TEXTLOCAL_API_KEY,
			template: process.env.TEXTLOCAL_TEMPLATE_CODE,
			otpValidityInMin: process.env.OTP_VALIDITY_INMIN
		};

		/*Password*/
		this.envConfig.pwd = {
			maxPwdHistory: process.env.MAX_PWD_HISTORY,
			verfiyLinkExpiry: process.env.VERIFY_LINK_EXPIRY_MIN,
			pwdHistoryCheck: process.env.PWD_HISTORY_CHECK
		};

		/*Init mail credentials*/
		this.envConfig.mailConfig = {
			transport: {
				host: process.env.MAIL_SVC_HOST,
				port: parseInt(process.env.MAIL_SVC_PORT, 10),
				auth: {
					user: process.env.MAIL_SVC_USERNAME,
					pass: process.env.MAIL_SVC_PASSWORD
				},
				tls: {
					rejectUnauthorized: false
				}
			},
			defaults: {
				from: {
					name: process.env.MAIL_SVC_FROM_NAME,
					address: process.env.MAIL_SVC_FROM
				}
			}
		};
		this.envConfig.emailTemplate = {
			contactUs: process.env.EMAIL_TEMP_CONTACT_US,
			Email: process.env.EMAIL_TEMP_EMAIL,
			uiUrl: process.env.UI_URL
		};
	}

	get(key: string): any {
		return this.envConfig[key];
	}
}
