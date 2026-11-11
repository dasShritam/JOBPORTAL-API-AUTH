import { AppConfigService } from '@app/config/appconfig.service';
import { WeekDays } from '@app/core/enums/employer-permission.enum';
import { EmailLogStatus, TimeConstants } from '@app/core/enums/mail-enums';
import { RoleGroup, RoleType } from '@app/core/enums/role-type.enum';
import AppLogger from '@app/core/logger/app-logger';
import { AuthMailService } from '@app/core/mail/mail.service';
import { addDays, convert_date_unix_ts, unix_ts_now } from '@app/core/utils/timestamp.utils';
import { DatabaseService } from '@app/database/database.service';
import { AbstractAuthDao } from '@app/database/mongo/abstract/auth.abstract';
import { AppSessionModel } from '@app/database/mongo/models/log.appsession.model';
import { OtpTraceModel } from '@app/database/mongo/models/otp-trace.model';
import { ProfileEmployerModel } from '@app/database/mongo/models/profile.employer.model';
import { ProfileJobSeekerModel } from '@app/database/mongo/models/profile.jobseeker.model';
import { UserAccountModel } from '@app/database/mongo/models/security.user-account.model';
import { TemporaryTokenModel } from '@app/database/mongo/models/temporary-token.model';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { CommonRegExp } from '@app/shared/regex.shared';
import ext_api_call from '@app/shared/restapi-request.shared';
import { BlobServiceClient } from '@azure/storage-blob';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AxiosRequestConfig } from 'axios';
import { compare, hash } from 'bcrypt';
import { constants, createHmac, privateDecrypt, randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { Types } from 'mongoose';
import { authenticator } from 'otplib';
import { join } from 'path';
import { stringify } from 'qs';
import { AbstractAuthSvc } from './auth.abstract';
import { ExistDto, ResendActLinkDto } from './dto/auth.dto';
import { blobInfo } from './models/blob-priniciple.model';
import { SendEmailDto } from './models/email-principal';
import { VerifyIdentityDto } from './models/job-seeker.register.dto';
import { AtPayload, RtPayload } from './models/jwt-payload.model';
import {
	SendOtpDto,
	forgetPwdVerificationPrincipal,
	otpSignIn,
	verifyAndCreateTokenPrincipal,
	verifyOtpPrincipal
} from './models/otp-principal.model';
import { ForgetPwdPrincipal } from './models/password.model';
import { EmployerRegisterDto } from './models/register-Employer.model';
import { ResetPasswordDto } from './models/reset-password.model';
import { AccessTokenPrincipal, RefreshTokenPrincipal, State } from './models/token-principal.model';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { MASTER_SCHEMA_GROUP } from '@app/database/mongo/schemas/master.generic.schema';
import { isValidDate } from '../../shared/validate.shared';

@Injectable()
export class AuthService implements AbstractAuthSvc {
	private readonly _authTxn: AbstractAuthDao;
	constructor(
		private readonly _appConfigSvc: AppConfigService,
		private _jwtService: JwtService,
		readonly _dbSvc: DatabaseService,
		readonly _loggerSvc: AppLogger,
		private _mailService: AuthMailService
	) {
		this._authTxn = _dbSvc.authTxn;
	}

	async accExists(data: ExistDto): Promise<AppResponse> {
		try {
			let details: any = data.data;
			let options: UserAccountModel | ProfileJobSeekerModel = {};
			for (let i = 0; i < details?.length; i++) {
				switch (details[i].key) {
					case 'email':
						const emailReq = new RegExp(CommonRegExp.EMAIL_REGEXP);
						if (!emailReq.test(details[i].value)) return createResponse(HttpStatus.BAD_REQUEST, messages.E17);
						options = {
							uname: details[i].value
						};
						details[i].exist = await this._authTxn.userNameExists(options);

						break;
					case 'phone':
						if (!details[i]?.code) return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W28, ['Country code']));
						const phoneReg = new RegExp(CommonRegExp.PHONE_CCODE_REGEXP);
						if (!phoneReg.test(`${details[i].code} ${details[i].value}`))
							return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['phone number']));

						const dob = details.find((det) => det.key === 'dob')?.value;
						if (dob) {
							const date = new Date(dob);
							if (isNaN(date.getTime())) return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['date of birth']));
						}

						options = {
							ci: {
								prim: {
									ph: {
										val: details[i].value,
										code: details[i].code
									}
								}
							},
							profile: {
								dob_ts: dob ? convert_date_unix_ts(dob) : null
							}
						};

						details[i].exist = await this._authTxn.phoneExists(options);

						break;
				}
			}

			details = details.filter((i) => {
				return i.key !== 'dob';
			});

			return createResponse(HttpStatus.OK, messages.S3, details);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	parseJwt(token: string) {
		try {
			return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async generateAccessToken(payload: AtPayload, tokenMetadata: any): Promise<AppResponse> {
		try {
			const token = await this._jwtService.signAsync(payload, {
				secret: tokenMetadata.appAtSecret,
				expiresIn: `${tokenMetadata.atExpiresIn}m`
			});
			return createResponse(HttpStatus.OK, messages.S3, token);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async generateRefreshToken(payload: RtPayload, tokenMetadata: any): Promise<AppResponse> {
		try {
			const refresh_token = await this._jwtService.signAsync(payload, {
				secret: tokenMetadata.appRtSecret
			});
			return createResponse(HttpStatus.OK, messages.S3, refresh_token);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async settoken_meta(): Promise<AppResponse> {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata'),
				credMetaInfo = {
					atExpiresIn: tokenMetadata.web.at.expiresIn,
					rtExpiresIn: tokenMetadata.web.rt.expiresIn,
					maxTtl: tokenMetadata.web.rt.maxTtl,
					appAtSecret: tokenMetadata.appAtSecret,
					appRtSecret: tokenMetadata.appRtSecret
				};
			return createResponse(HttpStatus.OK, messages.S3, credMetaInfo);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async setrole_payload(role: any): Promise<AppResponse> {
		try {
			const roles = [];
			switch (role.toUpperCase()) {
				case RoleType.ADMINISTRATOR:
					roles.push(RoleType.ADMINISTRATOR);
					break;
				case RoleType.SUPER_ADMINISTRATOR:
					roles.push(RoleType.SUPER_ADMINISTRATOR);
					break;
				case RoleType.JOBSEEKER:
					roles.push(RoleType.JOBSEEKER);
					break;
				case RoleType.EMPLOYER_ADMINISTRATOR:
					roles.push(RoleType.EMPLOYER_ADMINISTRATOR);
					break;
				case RoleType.RECRUITER:
					roles.push(RoleType.RECRUITER);
					break;
				default:
					return createResponse(HttpStatus.BAD_REQUEST, messages.W10);
			}
			return createResponse(HttpStatus.OK, messages.S3, roles);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async validateToken(token: string): Promise<any> {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata');
			const jwtRes = await this._jwtService.verifyAsync(token, {
				secret: tokenMetadata.appAtSecret
			});
			return createResponse(HttpStatus.OK, messages.S3, jwtRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.UNAUTHORIZED);
			return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
		}
	}

	async validateTempToken(token: string): Promise<any> {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata');
			const jwtRes = await this._jwtService.verifyAsync(token, {
				secret: tokenMetadata.appTempAtSecret
			});
			return createResponse(HttpStatus.OK, messages.S3, jwtRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.UNAUTHORIZED);
			return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
		}
	}

	/*Compare password*/
	async comparePassword(password: string, hashString: string): Promise<boolean> {
		try {
			return await compare(password, hashString);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return false;
		}
	}

	/*Verify Otp*/
	async verifyPhoneOtp(commData: verifyOtpPrincipal): Promise<any> {
		try {
			const environment = this._appConfigSvc.get('app').environment.toLowerCase();
			const otpOptions: OtpTraceModel = {
				to: commData.to,
				txn_id: commData.txn_id,
				verified: false
			};
			let otpRes: any;

			if (environment !== 'development') {
				/**/
				const isValid = authenticator.verify({ secret: commData.txn_id, token: commData.otp });
				if (!isValid) return createResponse(HttpStatus.BAD_REQUEST, messages.W19);
				otpOptions.otp = Number(commData.otp);
				otpRes = await this._authTxn.fetchOtpInfoByOtp(otpOptions);
			} else {
				otpRes = await this._authTxn.fetchOtpInfoBytxnId(otpOptions);
			}

			if (!otpRes) return createResponse(HttpStatus.BAD_REQUEST, messages.W19);
			/*Invalidate OTP */
			const otpSetOptions: OtpTraceModel = {
				txn_id: commData.txn_id,
				verified: true
			};
			const dbRes = await this._authTxn.invalidateOtp(otpSetOptions);
			if (dbRes.code !== HttpStatus.OK) return dbRes;

			/*verify if Phone number is not verified*/

			if (otpRes?.user_id) {
				const contactObj: UserAccountModel = {
					ci: {
						prim: {
							ph: {
								code: commData.to.slice(0, 3),
								val: commData.to.slice(3)
							}
						}
					},
					_id: otpRes.user_id
				};
				const res = await this._authTxn.markPhNoVerified(contactObj);
				if (res.code !== HttpStatus.OK) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W12);
				}
			}
			return createResponse(HttpStatus.OK, messages.S6);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
		}
	}

	/*Verify Otp*/

	/*Verify Email Otp*/
	async verifyEmailOtp(commData: verifyOtpPrincipal): Promise<any> {
		try {
			/**/
			const isValid = authenticator.verify({ secret: commData.txn_id, token: commData.otp });
			if (!isValid) return createResponse(HttpStatus.BAD_REQUEST, messages.W19);
			/*Verify OTP and get information*/
			const otpOptions: OtpTraceModel = {
					to: commData.to,
					otp: Number(commData.otp),
					txn_id: commData.txn_id,
					verified: false
				},
				otpRes = await this._authTxn.fetchOtpInfoByOtp(otpOptions);
			if (!otpRes) return createResponse(HttpStatus.BAD_REQUEST, messages.W19);
			/*Invalidate OTP */
			const otpSetOptions: OtpTraceModel = {
				user_id: otpRes._id,
				// exp_ts: unix_ts_now(),
				verified: true
			};
			const dbRes = await this._authTxn.invalidateOtp(otpSetOptions);
			if (dbRes.code !== HttpStatus.OK) return dbRes;
			if (otpRes?.user_id) {
				const contactObj: UserAccountModel = {
					ci: {
						prim: {
							mail: {
								val: commData.to,
								iv: true
							}
						}
					},
					_id: otpRes.user_id
				};
				const res = await this._authTxn.markEmailVerified(contactObj);
				if (res.code !== HttpStatus.OK) {
					return createResponse(HttpStatus.BAD_REQUEST, 'Unable to verify EmailId');
				}
			}
			return createResponse(HttpStatus.OK, messages.S6);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.BAD_REQUEST, messages.W7, error.stack);
		}
	}

	async verifyAndCreateToken(commData: verifyAndCreateTokenPrincipal): Promise<any> {
		try {
			/*Fetch OTP txn information*/
			const option: OtpTraceModel = { txn_id: commData.txn_id },
				dbRes1 = await this._authTxn.fetchOtpInfo(option);
			if (dbRes1.code != HttpStatus.OK) return dbRes1;

			/*Extract user information*/
			const otpTxnInfo = dbRes1.data,
				userId = otpTxnInfo.user_id,
				userInfoOptions: UserAccountModel = {
					_id: userId
				},
				dbRes3 = await this._authTxn.fetchUsrInfoByuserId(userInfoOptions);
			if (dbRes3.code !== HttpStatus.OK) return dbRes3;

			/*Verify OTP*/
			const userInfo = dbRes3.data,
				options: verifyOtpPrincipal = {
					to: `${userInfo.ci.prim.ph.code}${userInfo.ci.prim.ph.val}`,
					txn_id: commData.txn_id,
					otp: `${commData.otp}`,
					channel: 'sms'
				},
				verifyRes = await this.verifyOtp(options);
			if (verifyRes.code !== 200) return verifyRes;

			/*Read jwt metadata*/
			const credRes = await this.settoken_meta();
			if (credRes.code !== 200) return credRes;
			const tokenMetadata = credRes.data;

			/*Set role*/

			const roleRes = await this.setrole_payload(userInfo.role);
			if (roleRes.code !== 200) return roleRes;
			/*Create token model*/
			const sid = new Types.ObjectId(),
				device = {
					id: commData.state.uniqueid,
					ua: commData.state.agent_type
				},
				aTpayload: AtPayload = {
					sub: userInfo._id,
					roles: roleRes.data,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name,
					ip_address: commData.state.ip
				};
			/*Set permission in payload when user is restricted*/
			userInfo.prm?.length ? (aTpayload.permission = userInfo.prm) : false;

			/*Generate access token*/
			const accessTokenRes = await this.generateAccessToken(aTpayload, tokenMetadata);
			if (accessTokenRes.code !== 200) return accessTokenRes;
			const access_token = accessTokenRes.data,
				rTpayload: RtPayload = {
					sub: userInfo._id,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name
				};

			/*Generate refresh token*/
			const refreshTokenRes = await this.generateRefreshToken(rTpayload, tokenMetadata);
			if (refreshTokenRes.code !== 200) return refreshTokenRes;
			const refresh_token = refreshTokenRes.data,
				ts_now = unix_ts_now(),
			
				session: AppSessionModel = {
					_id: sid,
					user_id: userInfo._id,
					role: aTpayload.roles[0],
					start_ts: ts_now,
					end_ts: ts_now + parseInt(tokenMetadata.rtExpiresIn) * 60,
					device: device,
					ip: [
						{
							adr: commData.state.ip,
							start_ts: unix_ts_now()
						}
					]
				},
				signInRes = {
					access_token,
					refresh_token,
					state: {
						uniqueid: commData.state.uniqueid,
						ondemandpage: commData.state.ondemandpage,
						agent_type: commData.state.agent_type
					},
					exp: await this.parseJwt(access_token).exp
				};

			const sessionRes = await this._authTxn.createSession(session);
			if (sessionRes.code !== 200) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
			return createResponse(HttpStatus.OK, messages.S8, signInRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}
	async decodePassword(password: string, login?: boolean): Promise<AppResponse> {
		try {
			const file = join(__dirname, '../../../private.pem'),
				privateKey = readFileSync(file, { encoding: 'utf-8' }),
				decryptedData = privateDecrypt(
					{
						key: privateKey,
						padding: constants.RSA_PKCS1_PADDING
					},
					Buffer.from(password, 'base64')
				),
				rawPwd = decryptedData.toString('utf8');
			if (!login && !CommonRegExp.PASSWORD_REGEX.test(rawPwd)) return createResponse(HttpStatus.BAD_REQUEST, messages.W29);
			return createResponse(HttpStatus.OK, messages.S3, { rawPwd });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.BAD_REQUEST, messages.W40);
		}
	}

	async otpSignIn(signInCred: otpSignIn): Promise<any> {
		try {
			/*Fetch user info*/
			const options: UserAccountModel = {
				ci: {
					prim: {
						ph: {
							val: signInCred.phNo,
							code: signInCred.code
						}
					}
				}
			};
			if (signInCred?.role) options.role = signInCred?.role;
			let usrInfo = await this._authTxn.fetchUsrInfoByPhone(options);
			if (usrInfo.code !== HttpStatus.OK) return usrInfo;
			usrInfo = usrInfo?.data;

			/*Check phone number exist or phone number is verified*/
			if (!usrInfo || usrInfo?.role == RoleType.ADMINISTRATOR || !usrInfo?.active || !usrInfo.role) {
				const message = messageFactory(`${messages.E18} ${messages.G1}`, [signInCred.phNo]);
				return createResponse(HttpStatus.OK, message);
			}

			const commData: SendOtpDto = {
				ip: signInCred.ip,
				to: `${usrInfo.ci.prim.ph.code}${usrInfo.ci.prim.ph.val}`,
				user_id: usrInfo._id,
				channel: 'sms'
			};
			const otpRes = await this.sendOtp(commData);
			if (otpRes.code === HttpStatus.OK) {
				const sendOtpRes = {
					maskedTo: otpRes.data.masked_to,
					txn_id: otpRes.data.txn_id
				};
				return createResponse(HttpStatus.OK, messages.S5, sendOtpRes);
			} else {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W1);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.BAD_REQUEST, messages.W1, error.stack);
		}
	}

	//#region Sign In
	async googleSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Generate google access token*/
			const tokenRes = await this.generateGoogleAccessToken(signInCred);
			if (tokenRes.code !== 200) return tokenRes;

			/*Fetch google profile*/
			const profileRes = await this.googleProfile(tokenRes.data.access_token);
			if (profileRes.code !== 200) return profileRes;

			/*Validate user registered with system*/
			const profile = (({ id, name, email }) => ({ id, name, email }))(profileRes.data),
				options: UserAccountModel = {
					soc_net: {
						id: profile.id,
						name: signInCred.authType
					}
				},
				dbRes = await this._authTxn.fetchUsrInfoBySocNtw(options);
			if (dbRes.code !== HttpStatus.OK || !dbRes.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W4);

			const userInfo = dbRes.data;
			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!RoleGroup.JOBSEEKER.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			}

			return this.generateToken(signInCred, dbRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async linkedInSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Generate linked in access token*/
			const tokenRes = await this.generateLinkedInAccessToken(signInCred);
			if (tokenRes.code !== 200) return tokenRes;
			const access_token = tokenRes.data.access_token;

			/*Fetch linked in profile*/
			const profileRes = await this.linkedInMe(access_token);
			if (profileRes.code !== 200) return profileRes;

			/*Validate user registered with system*/
			const profile = (({ id, name }) => ({ id, name }))(profileRes.data),
				options: UserAccountModel = {
					soc_net: {
						id: profile.id,
						name: signInCred.authType
					}
				},
				dbRes = await this._authTxn.fetchUsrInfoBySocNtw(options);
			if (dbRes.code !== HttpStatus.OK || !dbRes.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W4);

			const userInfo = dbRes.data;
			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!RoleGroup.JOBSEEKER.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			}

			/*Generate application access token*/
			return this.generateToken(signInCred, dbRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async facebookSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Generate facebook access token*/
			const tokenRes = await this.generateFacebookAccessToken(signInCred);
			if (tokenRes.code !== 200) return tokenRes;
			const fb_access_token = tokenRes.data.access_token;

			/*Fetch facebook profile*/
			const profileRes = await this.facebookProfile(fb_access_token);
			if (profileRes.code !== 200) return profileRes;

			/*Validate user registered with system*/
			const profile = (({ id, name }) => ({ id, name }))(profileRes.data),
				options: UserAccountModel = {
					soc_net: {
						id: profile.id,
						name: signInCred.authType
					}
				},
				dbRes = await this._authTxn.fetchUsrInfoBySocNtw(options);
			if (dbRes.code !== HttpStatus.OK || !dbRes.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W4);

			const userInfo = dbRes.data;
			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!RoleGroup.JOBSEEKER.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			}

			/*Generate application access token*/
			return this.generateToken(signInCred, dbRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async twitterSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Generate twitter access token*/
			const tokenRes = await this.generateTwitterAccessToken(signInCred);
			if (tokenRes.code !== 200) return tokenRes;
			const twitter_access_token = tokenRes.data.access_token;

			/*Fetch twitter profile*/
			const profileRes = await this.twitterProfile(twitter_access_token);
			if (profileRes.code !== 200) return profileRes;

			/*Validate user registered with system*/
			const profile = (({ id, name }) => ({ id, name }))(profileRes.data),
				options: UserAccountModel = {
					soc_net: {
						id: profile.id,
						name: signInCred.authType
					}
				},
				dbRes = await this._authTxn.fetchUsrInfoBySocNtw(options);
			if (dbRes.code !== HttpStatus.OK || !dbRes.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W4);

			const userInfo = dbRes.data;
			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!RoleGroup.JOBSEEKER.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			}

			/*Generate application access token*/
			return this.generateToken(signInCred, dbRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async validateCredentials(signInCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			/*Fetch user info*/
			const options: UserAccountModel = {
					uname: signInCred.authKey
				},
				dbRes = await this._authTxn.fetchUsrInfoByuname(options);

			/*Check user exists in*/
			if (dbRes.code !== 200) return dbRes;

			const userInfo = dbRes.data;

			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!signInCred.requestee.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			} else if (!userInfo?.pwd.length) {
				/*Validate password is empty*/
				return createResponse(HttpStatus.BAD_REQUEST, messages.W3);
			}
			/*Get active password*/
			const activePwd = userInfo?.pwd.filter((pwd: any) => pwd.active === true);

			/*check active password should not be greater then 1*/
			if (activePwd.length > 1 || activePwd.length === 0) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W3);
			}

			/*Validate password*/
			const isValidPwd = await this.comparePassword(signInCred.pwd, activePwd[0].hash);
			if (!isValidPwd) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W3);
			}
			return createResponse(HttpStatus.OK, messages.S3, userInfo);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async adminSignIn(signInCred: AccessTokenPrincipal) {
		try {
			const decryptRes = await this.decodePassword(signInCred.pwd, true);
			if (decryptRes.code !== 200) return decryptRes;
			signInCred.pwd = decryptRes.data.rawPwd;

			/*Set possible role here*/
			signInCred.requestee = RoleGroup.ADMIN_SUPERADMIN;

			/*Validate user information and input credentials*/
			const validationRes = await this.validateCredentials(signInCred);

			if (validationRes.code !== 200) return validationRes;
			const userInfo = validationRes.data,
				/*Send OTP to registered mobile number as part of MFA*/
				commData: SendOtpDto = {
					ip: signInCred.state.ip,
					to: `${userInfo?.ci?.prim?.ph?.code}${userInfo?.ci?.prim?.ph?.val}`,
					user_id: userInfo._id,
					channel: 'sms'
				},
				otpRes = await this.sendOtp(commData);
			if (otpRes.code !== HttpStatus.OK) return otpRes;
			const sendOtpRes = {
				maskedTo: otpRes.data.masked_to,
				txn_id: otpRes.data.txn_id
			};
			return createResponse(HttpStatus.OK, messages.S5, sendOtpRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}
	addTimezoneOffset(offsetMinutes: number, datetimeString?: Date) {
		// Create a new Date object from the input datetime string
		const datetime = datetimeString ? datetimeString : new Date();

		// Get the timezone offset in minutes for the local time zone
		const localOffset = datetime.getTimezoneOffset();

		// Calculate the total offset in minutes by adding the local offset and the input offset
		const totalOffset = localOffset + offsetMinutes;

		// Create a new Date object with the adjusted time by adding the total offset in minutes
		const adjustedDatetime = new Date(datetime.getTime() + totalOffset * 60 * 1000);

		// Format the adjusted datetime as a string in ISO 8601 format
		// const adjustedDatetimeString = adjustedDatetime.toISOString();

		// Return the adjusted datetime string
		return adjustedDatetime;
	}

	async validateEmployeeUserPrms(empInfo: any) {
		try {
			const timezoneOffset = 330;
			const accessability = empInfo?.accessability ? empInfo?.accessability : null;
			if (accessability?.days?.length) {
				const currentDay = this.addTimezoneOffset(timezoneOffset).getDay();
				const restrictedDay = accessability.days.includes(currentDay);
				if (restrictedDay) {
					const updatedArray = accessability?.days.map((day) => WeekDays.WEEKDAYS[day]);
					let concatenatedString = updatedArray.join(', ');
					if (updatedArray.length > 1) {
						concatenatedString = updatedArray.slice(0, -1).join(', ') + ' and ' + updatedArray.slice(-1);
					} else {
						concatenatedString = updatedArray[0];
					}
					return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W37, [`${concatenatedString}`]));
				}
			}

			const currtTime = unix_ts_now();
			if ((accessability?.till && accessability.till < currtTime) || (accessability?.from && accessability.from > currtTime)) {
				const endDate = new Date(accessability.till * 1000);
				const zoneEndDate = this.addTimezoneOffset(timezoneOffset, endDate);
				const options: any = { hour: 'numeric', minute: 'numeric' };
				const endTime = zoneEndDate.toLocaleTimeString([], options);
				const startDate = new Date(accessability.from * 1000);
				const zoneStartDate = this.addTimezoneOffset(timezoneOffset, startDate);
				const startTime = zoneStartDate.toLocaleTimeString([], options);
				return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W38, [`${startTime}`, `${endTime}`]));
			}

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async employerSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Decrypt password*/
			const decryptRes = await this.decodePassword(signInCred.pwd, true);
			if (decryptRes.code !== 200) return decryptRes;
			signInCred.pwd = decryptRes.data.rawPwd;

			/*Set possible role here*/
			signInCred.requestee = RoleGroup.EMP_ADMIN_RECRUITER;

			/*Validate user information and input credentials*/
			const validationRes = await this.validateCredentials(signInCred);

			if (validationRes.code !== 200) return validationRes;

			const userInfo = validationRes.data,
				/*Fetch user profile and org information*/
				orgOpts: ProfileEmployerModel = {
					user_id: new Types.ObjectId(userInfo._id)
				},
				dbRes = await this._authTxn.fetchEmployerProfile(orgOpts);
			if (dbRes.code !== HttpStatus.OK) return dbRes;

			const empProfile = dbRes.data;
			/*validate employee user permissions*/
			if (validationRes.data.role === RoleType.RECRUITER) {
				const validateInfo = await this.validateEmployeeUserPrms(empProfile);
				if (validateInfo.code !== HttpStatus.OK) return validateInfo;
			}
			const credRes = await this.settoken_meta();
			if (credRes.code !== 200) return credRes;
			const tokenMetadata = credRes.data,
				/*Set role*/
				roleRes = await this.setrole_payload(userInfo.role);
			if (roleRes.code !== 200) return roleRes;
			/*Create token model*/
			const sid = new Types.ObjectId(),
				device = {
					id: signInCred.state.uniqueid,
					ua: signInCred.state.agent_type
				},
				aTpayload: AtPayload = {
					sub: userInfo._id,
					roles: roleRes.data,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name,
					ip_address: signInCred.state.ip,
					company_id: empProfile.company_id
				};
			/*Set permission in payload when user is restricted*/
			userInfo.prm?.length ? (aTpayload.permission = userInfo.prm) : false;

			/*Generate access token*/
			const accessTokenRes = await this.generateAccessToken(aTpayload, tokenMetadata);
			if (accessTokenRes.code !== 200) return accessTokenRes;
			const access_token = accessTokenRes.data,
				rTpayload: RtPayload = {
					sub: userInfo._id,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name
				};
			/*Generate refresh token*/
			const refreshTokenRes = await this.generateRefreshToken(rTpayload, tokenMetadata);
			if (refreshTokenRes.code !== 200) return refreshTokenRes;
			const refresh_token = refreshTokenRes.data,
				ts_now = unix_ts_now(),
				session: AppSessionModel = {
					_id: sid,
					user_id: userInfo._id,
					role: aTpayload.roles[0],
					start_ts: ts_now,
					end_ts: ts_now + parseInt(tokenMetadata.rtExpiresIn) * 60,
					device: device,
					ip: [
						{
							adr: signInCred.state.ip,
							start_ts: unix_ts_now()
						}
					]
				},
				signInRes = {
					access_token,
					refresh_token,
					state: {
						uniqueid: signInCred.state.uniqueid,
						ondemandpage: signInCred.state.ondemandpage,
						agent_type: signInCred.state.agent_type
					},
					exp: await this.parseJwt(access_token).exp,
					tc_accepted: empProfile.tc_accepted
				};

			const sessionRes = await this._authTxn.createSession(session);
			if (sessionRes.code !== 200) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
			return createResponse(HttpStatus.OK, messages.S8, signInRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	async jobseekerSignIn(signInCred: AccessTokenPrincipal) {
		try {
			/*Decrypt password*/
			const decryptRes = await this.decodePassword(signInCred.pwd, true);
			if (decryptRes.code !== 200) return decryptRes;
			signInCred.pwd = decryptRes.data.rawPwd;

			/*Set possible role here*/
			signInCred.requestee = RoleGroup.JOBSEEKER;

			/*Validate user information and input credentials*/
			const validationRes = await this.validateCredentials(signInCred);

			if (validationRes.code !== 200) return validationRes;

			const userInfo = validationRes.data,
				credRes = await this.settoken_meta();
			if (credRes.code !== 200) return credRes;
			const tokenMetadata = credRes.data,
				/*Set role*/
				roleRes = await this.setrole_payload(userInfo.role);
			if (roleRes.code !== 200) return roleRes;

			/*Create token model*/
			const sid = new Types.ObjectId(),
				device = {
					id: signInCred.state.uniqueid,
					ua: signInCred.state.agent_type
				},
				aTpayload: AtPayload = {
					sub: userInfo._id,
					roles: roleRes.data,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name,
					ip_address: signInCred.state.ip
				};

			/*Set permission in payload when user is restricted*/
			userInfo.prm?.length ? (aTpayload.permission = userInfo.prm) : false;

			/*Generate access token*/
			const accessTokenRes = await this.generateAccessToken(aTpayload, tokenMetadata);
			if (accessTokenRes.code !== 200) return accessTokenRes;
			const access_token = accessTokenRes.data,
				rTpayload: RtPayload = {
					sub: userInfo._id,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name
				};

			/*Generate refresh token*/
			const refreshTokenRes = await this.generateRefreshToken(rTpayload, tokenMetadata);
			if (refreshTokenRes.code !== 200) return refreshTokenRes;
			const refresh_token = refreshTokenRes.data,
				ts_now = unix_ts_now(),
				session: AppSessionModel = {
					_id: sid,
					user_id: userInfo._id,
					role: aTpayload.roles[0],
					start_ts: ts_now,
					end_ts: ts_now + parseInt(tokenMetadata.rtExpiresIn) * 60,
					device: device,
					ip: [
						{
							adr: signInCred.state.ip,
							start_ts: unix_ts_now()
						}
					]
				},
				signInRes = {
					access_token,
					refresh_token,
					state: {
						uniqueid: signInCred.state.uniqueid,
						ondemandpage: signInCred.state.ondemandpage,
						agent_type: signInCred.state.agent_type
					},
					exp: await this.parseJwt(access_token).exp
				};

			const sessionRes = await this._authTxn.createSession(session);
			if (sessionRes.code !== 200) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
			return createResponse(HttpStatus.OK, messages.S8, signInRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}
	async socialMediaSignIn(signInCred: AccessTokenPrincipal) {
		try {
			switch (signInCred.authType.toLowerCase()) {
				case 'google':
					return this.googleSignIn(signInCred);
				case 'linkedin':
					return this.linkedInSignIn(signInCred);
				case 'facebook':
					return this.facebookSignIn(signInCred);
				case 'twitter':
					return this.twitterSignIn(signInCred);
				default:
					return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['authentication type']));
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9);
		}
	}
	//#endregion

	//#region Google Authentication Flow
	async generateGoogleAccessToken(signInCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			const googleSsoCred = this._appConfigSvc.get('authSso').google,
				axiosdata = stringify({
					client_id: googleSsoCred.clientId,
					client_secret: googleSsoCred.clientSecret,
					code: signInCred.authKey,
					grant_type: 'authorization_code',
					redirect_uri: signInCred.state.redirect_uri
				}),
				options = {
					method: 'POST',
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					data: axiosdata,
					url: 'https://oauth2.googleapis.com/token'
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async googleProfile(accessToken: string): Promise<AppResponse> {
		try {
			const options = {
					method: 'GET',
					headers: { Authorization: `Bearer ${accessToken}` },
					url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}
	//#endregion

	//#region Linked In Authentication Flow
	async generateLinkedInAccessToken(signInCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			const linkedSsoCred = this._appConfigSvc.get('authSso').linkedIn,
				axiosdata = stringify({
					client_id: linkedSsoCred.clientId,
					client_secret: linkedSsoCred.clientSecret,
					code: signInCred.authKey,
					grant_type: 'authorization_code',
					redirect_uri: signInCred.state.redirect_uri
				}),
				options = {
					method: 'POST',
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					data: axiosdata,
					url: 'https://www.linkedin.com/oauth/v2/accessToken'
				},
				restRes = await ext_api_call(options);
			if (restRes.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, restRes.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, restRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async linkedInMe(token: string): Promise<AppResponse> {
		try {
			const config = {
					method: 'GET',
					url: 'https://api.linkedin.com/v2/me',
					headers: {
						'content-type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				},
				restRes = await ext_api_call(config);

			if (restRes.status === 200) {
				let profile: any = (({ localizedFirstName, localizedLastName, id }) => ({ localizedFirstName, localizedLastName, id }))(restRes.data);
				profile = {
					name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
					id: profile.id
				};
				return createResponse(HttpStatus.OK, messages.S3, profile);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, restRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async linkedInEmailAddress(token: string): Promise<AppResponse> {
		try {
			const config = {
					method: 'GET',
					url: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
					headers: {
						'content-type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				},
				restRes = await ext_api_call(config);

			if (restRes.status === 200) {
				let profile = { email: '' };
				if (restRes.data.elements.length) {
					profile = { email: restRes.data.elements[0]['handle~'].emailAddress };
				}
				return createResponse(HttpStatus.OK, messages.S3, profile);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, restRes.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	//#endregion

	//#region Facebook Authentication Flow
	async generateFacebookAccessToken(signInCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			const fbSsoCred = this._appConfigSvc.get('authSso').facebook,
				options: AxiosRequestConfig = {
					method: 'GET',
					url: `https://graph.facebook.com/v16.0/oauth/access_token`,
					params: {
						client_id: fbSsoCred.clientId,
						redirect_uri: signInCred.state.redirect_uri,
						client_secret: fbSsoCred.clientSecret,
						code: signInCred.authKey
					}
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async facebookProfile(accessToken: string): Promise<AppResponse> {
		try {
			const options = {
					method: 'GET',
					url: `https://graph.facebook.com/me?access_token=${accessToken}&fields=email,name,id`
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	//#endregion

	//#region Twitter Authentication Flow
	async generateTwitterAccessToken(signInCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			const twitterSsoCred = this._appConfigSvc.get('authSso').twitter,
				axiosdata = stringify({
					client_id: twitterSsoCred.clientId,
					code: signInCred.authKey,
					grant_type: 'authorization_code',
					redirect_uri: signInCred.state.redirect_uri,
					code_verifier: signInCred.state.code_verifier
				}),
				options = {
					method: 'POST',
					headers: {
						Authorization: `Basic ${Buffer.from(`${twitterSsoCred.clientId}:${twitterSsoCred.clientSecret}`).toString('base64')}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: axiosdata,
					url: 'https://api.twitter.com/2/oauth2/token'
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async twitterProfile(accessToken: string): Promise<AppResponse> {
		try {
			const options = {
					method: 'GET',
					headers: { Authorization: `Bearer ${accessToken}` },
					url: 'https://api.twitter.com/2/users/me'
				},
				response = await ext_api_call(options);
			if (response.status === 200) {
				return createResponse(HttpStatus.OK, messages.S3, response.data.data);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.E9, response.data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}
	//#endregion

	async refreshToken(rtReq: RefreshTokenPrincipal): Promise<any> {
		try {
			const credRes = await this.settoken_meta();
			if (credRes.code !== 200) return credRes;
			const tokenMetadata = credRes.data,
				/*Validate refresh token*/
				tokenRes = await this.verifyRefreshToken(rtReq.refreshToken, tokenMetadata);
			if (tokenRes.code !== 200) return tokenRes;
			const rtClaims = tokenRes.data,
				dbRes = await this._authTxn.findSessionBySid(rtClaims);
			if (dbRes.code !== 200) return dbRes;
			const userSession = dbRes.data,
				claimsInfo = { tokenMetadata, rtClaims, userSession };
			if (userSession.user_info.role === RoleType.RECRUITER) {
				const orgOpts: ProfileEmployerModel = {
						user_id: new Types.ObjectId(userSession.user_id)
					},
					dbRes = await this._authTxn.fetchEmployerProfile(orgOpts);
				/*validate employee user permissions*/
				const validateInfo = await this.validateEmployeeUserPrms(dbRes);
				if (validateInfo.code !== HttpStatus.OK) return validateInfo;
			}
			return await this.authRefreshToken(rtReq, claimsInfo);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
			return createResponse(HttpStatus.BAD_REQUEST, messages.E3);
		}
	}

	async verifyRefreshToken(refresh_token: string, tokenMetadata: any): Promise<AppResponse> {
		try {
			const rtClaims = await this._jwtService.verifyAsync(refresh_token, {
				secret: tokenMetadata.appRtSecret,
				ignoreExpiration: true
			});
			return createResponse(HttpStatus.OK, messages.S3, rtClaims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
		}
	}
	async verify_auth_state(session: any, state: State): Promise<AppResponse> {
		try {
			const device = session?.device;
			if (device?.id?.toLowerCase() !== state.uniqueid?.toLowerCase()) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.E3);
			}
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async validate_ttl(session: any): Promise<AppResponse> {
		try {
			if (!session || !session.start_ts || !session.end_ts || !Number(session.start_ts) || !Number(session.end_ts)) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W6);
			}
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata'),
				maxTtl = Number(tokenMetadata.web.rt.maxTtl),
				difference = session.end_ts - session.start_ts,
				daysDifference = difference / (60 * 60 * 24);

			if (!maxTtl || daysDifference > maxTtl) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W6);
			}
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async authRefreshToken(rtReq: RefreshTokenPrincipal, claimsInfo: any): Promise<any> {
		try {
			const { tokenMetadata, rtClaims, userSession } = claimsInfo,
				userInfo = userSession.user_info;
			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			}

			/*Validate user has requested role*/
			if (userInfo.role.toUpperCase() !== userSession.role.toUpperCase()) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W31);
			}

			/*Verify organization status for user they have employer role*/
			let empProfile: any;
			if (RoleGroup.EMP_ADMIN_RECRUITER.includes(userInfo.role)) {
				const orgOpts: ProfileEmployerModel = {
						user_id: new Types.ObjectId(userSession.user_id)
					},
					dbRes = await this._authTxn.fetchEmployerProfile(orgOpts);
				if (dbRes.code !== HttpStatus.OK) return dbRes;
				empProfile = dbRes.data;
			}

			/*Validate state information*/
			const stateRes = await this.verify_auth_state(userSession, rtReq.state);
			if (stateRes.code !== 200) return stateRes;

			/**
			 * Set TTL for refresh token
			 */
			userSession.end_ts = userSession.end_ts + parseInt(tokenMetadata.atExpiresIn) * 60;
			const ttlRes = await this.validate_ttl(userSession);
			if (ttlRes.code !== 200) return ttlRes;

			const aTpayload: AtPayload = {
				sub: userSession.user_id,
				roles: [userSession.role],
				sid: userSession._id,
				username: rtClaims.username,
				name: rtClaims.name,
				ip_address: rtReq.state.ip
			};

			/*Set permission in payload when user is restricted*/
			userInfo.permission?.length ? (aTpayload.permission = userInfo.permission) : false;

			/*Set company id to payload if employer*/
			empProfile ? (aTpayload.company_id = empProfile.company_id) : false;

			const accessTokenRes = await this.generateAccessToken(aTpayload, tokenMetadata);
			if (accessTokenRes.code !== 200) return accessTokenRes;
			const access_token = accessTokenRes.data;
			const ip = userSession?.ip.slice(-1);
			if (ip[0].address !== rtReq.state.ip) {
				userSession['ipAddress'] = { ip: { address: rtReq.state.ip, start_ts: unix_ts_now() } };
			}

			if (userSession) await this._authTxn.updateSession(userSession);
			const res = {
				data: {
					access_token,
					exp: await this.parseJwt(access_token).exp
				}
			};
			return res;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async logout(sessionId: AtPayload): Promise<any> {
		try {
			return await this._authTxn.logoutSession(sessionId);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, String(sessionId.sid));
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E9);
		}
	}

	async chekPwdHistory(verifyPwd: any, newPwd: string) {
		for (let i = 0; i < verifyPwd.length; i++) {
			const comparetion = await this.comparePassword(newPwd, verifyPwd[i].hash);
			if (comparetion) {
				return true;
			}
		}
		return false;
	}

	//#region reset Password
	async resetPassword(userClaims: AtPayload, resetPwdDetails: ResetPasswordDto): Promise<AppResponse> {
		try {
			const decryptResOld = await this.decodePassword(resetPwdDetails.oldPassword);
			const decryptResNew = await this.decodePassword(resetPwdDetails.newPassword);
			if (decryptResOld.code !== 200) return decryptResOld;
			if (decryptResNew.code !== 200) return decryptResNew;
			resetPwdDetails.oldPassword = decryptResOld.data.rawPwd;
			resetPwdDetails.newPassword = decryptResNew.data.rawPwd;
			const user_id = userClaims.sub,
				minPwdSize: number = this._appConfigSvc.get('pwd').maxPwdHistory,
				{ oldPassword, newPassword } = resetPwdDetails,
				dbRes = await this._authTxn.fetchPassword(user_id); //fetch all existing password of that current ID
			if (dbRes.code !== 200) return dbRes;
			const userPwd = dbRes.data[0].pwd;
			if (!userPwd || !userPwd.length) return createResponse(HttpStatus.BAD_REQUEST, messages.E10);
			const currentPwd: any = userPwd.filter((e: any) => {
				return e.active === true;
			}); //fetch only existing active password object
			if (currentPwd.length !== 1) return createResponse(HttpStatus.BAD_REQUEST, messages.E10);
			if (!(await this.comparePassword(oldPassword, currentPwd[0].hash))) return createResponse(HttpStatus.BAD_REQUEST, messages.W8);
			if (await this.comparePassword(newPassword, currentPwd[0].hash)) return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W9);
			userPwd.sort((currentObj: any, nextObj: any) => currentObj.created_at - nextObj.created_at);
			const pwdData = userPwd.slice(0, this._appConfigSvc.get('pwd').pwdHistoryCheck);
			const verifyPwdHistory = await this.chekPwdHistory(pwdData, newPassword);
			if (verifyPwdHistory) return createResponse(HttpStatus.BAD_REQUEST, messages.E16);
			const resetPwdInfo = {
				operation: 'insert',
				user_id,
				newPwd: {
					hash: await hash(newPassword, 12),
					created_at: unix_ts_now(),
					active: true
				}
			};
			if (userPwd.length >= minPwdSize) {
				resetPwdInfo.operation = 'update';
				resetPwdInfo.newPwd['id'] = userPwd[0]._id;
			}
			const resultResponce = await this._authTxn.resetingPassword(resetPwdInfo);
			if (resultResponce.code === 200) {
				const sa_uri = this._appConfigSvc.get('app').sa_uri;
				const emailInfo: SendEmailDto = {
						filePath: '../../core/mail/templates/update-password.html',
						replacements: {
							FirstName: dbRes.data[0].name,
							redirectUrl: `/forgotPassword`,
							compName2: messages.G1,
							sa_uri: sa_uri
						},
						mailOptions: {
							to: dbRes.data[0].uname,
							subject: `${messages.G1} | ${messages.M1}`,
							text: messages.T2
						}
					},
					emailRes = await this.sendEmail(emailInfo);
				if (emailRes.code !== 200) return emailRes;
				return createResponse(HttpStatus.OK, messages.S7);
			} else {
				return resultResponce;
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, String(userClaims.sid));
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async verifyForgetPwd(commData: forgetPwdVerificationPrincipal): Promise<any> {
		try {
			let options: UserAccountModel = {};
			let userInfo: any;
			if (commData.authType === 'email') {
				options = { uname: commData.to };
				userInfo = await this._authTxn.fetchUsrInfoByuname(options);
				if (userInfo.code !== HttpStatus.OK) return userInfo;
				userInfo = userInfo?.data;
			} else {
				options = {
					ci: {
						prim: {
							ph: {
								val: commData.to.slice(3),
								code: commData.to.slice(0, 3)
							}
						}
					}
				};
				userInfo = await this._authTxn.fetchUsrInfoByPhone(options);
				if (userInfo.code !== HttpStatus.OK) return userInfo;
				userInfo = userInfo?.data;
			}
			if (!userInfo) {
				const message = messageFactory(`${messages.E18} ${messages.G1}`, [commData.to ? commData.to.slice(3) : commData.to]);
				return createResponse(HttpStatus.OK, message);
			}
			const verifyReq: verifyOtpPrincipal = {
				to: commData.to,
				otp: `${commData.otp}`,
				txn_id: commData.txn_id,
				channel: commData.authType
			};
			const res = await this.verifyOtp(verifyReq);
			if (userInfo && res.code === HttpStatus.OK) {
				const setDate = addDays(1),
					expieryDate = convert_date_unix_ts(setDate),
					tempTokenSession = {
						token: await this.generateTempUniqueToken(),
						user_id: new Types.ObjectId(userInfo._id),
						ip: commData.ip,
						exp_ts: expieryDate
					};
				const dbRes = await this._authTxn.createTempToken(tempTokenSession);
				if (dbRes.code === 200) {
					return createResponse(HttpStatus.OK, messages.S3, tempTokenSession.token);
				}
			} else {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async generateToken(signInCred: AccessTokenPrincipal, userInfo: any): Promise<AppResponse> {
		try {
			/*Read jwt meta information*/
			const credRes = await this.settoken_meta();
			if (credRes.code !== 200) return credRes;
			const tokenMetadata = credRes.data,
				/*Set role*/
				roleRes = await this.setrole_payload(userInfo.role);
			if (roleRes.code !== 200) return roleRes;

			/*Create token model*/
			const sid = new Types.ObjectId(),
				device = {
					id: signInCred.state.uniqueid,
					ua: signInCred.state.agent_type
				},
				aTpayload: AtPayload = {
					sub: userInfo._id,
					roles: roleRes.data,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name,
					ip_address: signInCred.state.ip
				};

			/*Set permission in payload when user is restricted*/
			userInfo.prm?.length ? (aTpayload.permission = userInfo.prm) : false;

			/*Generate access token*/
			const accessTokenRes = await this.generateAccessToken(aTpayload, tokenMetadata);
			if (accessTokenRes.code !== 200) return accessTokenRes;
			const access_token = accessTokenRes.data,
				rTpayload: RtPayload = {
					sub: userInfo._id,
					sid: sid,
					username: userInfo.uname,
					name: userInfo.name
				};

			/*Generate refresh token*/
			const refreshTokenRes = await this.generateRefreshToken(rTpayload, tokenMetadata);
			if (refreshTokenRes.code !== 200) return refreshTokenRes;
			const refresh_token = refreshTokenRes.data,
				ts_now = unix_ts_now(),
				session: AppSessionModel = {
					_id: sid,
					user_id: userInfo._id,
					role: aTpayload.roles[0],
					start_ts: ts_now,
					end_ts: ts_now + parseInt(tokenMetadata.rtExpiresIn) * 60,
					device: device,
					ip: [
						{
							adr: signInCred.state.ip,
							start_ts: unix_ts_now()
						}
					]
				},
				signInRes = {
					access_token,
					refresh_token,
					state: {
						caller: signInCred.state.caller,
						uniqueid: signInCred.state.uniqueid,
						ondemandpage: signInCred.state.ondemandpage,
						agent_type: signInCred.state.agent_type
					},
					exp: await this.parseJwt(access_token).exp
				};

			const sessionRes = await this._authTxn.createSession(session);
			if (sessionRes.code !== 200) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
			return createResponse(HttpStatus.OK, messages.S3, signInRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E7);
		}
	}

	//#region Social media registration
	private async prepareMdlAndRegister(registerCred: AccessTokenPrincipal, profile: any): Promise<AppResponse> {
		try {
			const userId = new Types.ObjectId(),
				userAccount = {
					_id: userId,
					uname: profile.email,
					name: profile.name,
					ci: {
						prim: {
							mail: {
								val: profile.email,
								iv: true
							}
						}
					},
					soc_net: [
						{
							_id: false,
							id: profile.id.toUpperCase(),
							name: registerCred.authType.toUpperCase(),
							created_at: unix_ts_now()
						}
					],
					role: RoleType.JOBSEEKER,
					reg_mode: registerCred.authType.toUpperCase(),
					created_by: userId
				};
			/*Create new account and profile*/
			return await this._authTxn.setUpUserAccount(userAccount);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	private async generateTempUniqueToken(): Promise<string> {
		try {
			return createHmac('sha512', randomBytes(16).toString('base64')).update(`${new Types.ObjectId()} ${unix_ts_now()}`).digest('hex');
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return '';
		}
	}

	private async pepareTokenMdlandSave(ip: string, profile: any) {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata');
			let exp_time = unix_ts_now() + parseInt(tokenMetadata.web.tempAt.expiresIn) * 60;
			exp_time = exp_time ? exp_time : 5;
			const tempTokenMdl: TemporaryTokenModel = {
				token: await this.generateTempUniqueToken(),
				ip,
				data: JSON.stringify(profile),
				exp_ts: exp_time
			};
			await this._authTxn.createTempToken(tempTokenMdl);
			return createResponse(HttpStatus.OK, messages.S3, tempTokenMdl);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	private async verifyAndRegister(registerCred: AccessTokenPrincipal, profile: any) {
		try {
			/*Fetch user information if exists*/
			const options = {
				uname: profile.email?.toLowerCase()
			};
			const dbRes = await this._authTxn.fetchUsrVerifyReg(options);

			if (dbRes.code !== HttpStatus.OK) return dbRes;
			let userInfo = dbRes.data,
				is_media_reg_db = false,
				is_email_exists_db = false;
			/*Check social media id exists*/
			if (userInfo) {
				/*Validate user alredy registred with other roles*/
				if (userInfo.role !== RoleType.JOBSEEKER) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W13);
				}
				const socNet = userInfo.soc_net;
				is_email_exists_db = profile.email === userInfo.uname;
				if (socNet && socNet.length > 0) {
					const exists = socNet.find(
						(obj: any) => obj.id?.toUpperCase() === profile.id?.toUpperCase() && obj.name.toLowerCase() === registerCred.authType.toLowerCase()
					);
					if (exists) {
						is_media_reg_db = true;
					}
				}
			}

			/*Check email id is exists from profile res and not registered*/
			if (!profile.email && !is_media_reg_db) {
				const regRes: any = (({ name, email }) => ({ name, email }))(profile),
					/*Create temporary token and save*/
					tempTokenRes = await this.pepareTokenMdlandSave(registerCred.state.ip, { authType: registerCred.authType, ...profile });
				if (tempTokenRes.code !== HttpStatus.OK) return tempTokenRes;
				regRes.token = tempTokenRes.data.token;
				/*Create temporary token and log basic profile info */
				return createResponse(HttpStatus.PARTIAL_CONTENT, messageFactory(messages.W16, [registerCred.authType?.toLowerCase()]), regRes);
			}

			if (!is_media_reg_db && !is_email_exists_db) {
				/*Register user as Jobseeker*/
				const regRes = await this.prepareMdlAndRegister(registerCred, profile);
				userInfo = regRes.data;
			} else if (!is_media_reg_db && is_email_exists_db) {
				/*Update media ref with social media id if not exists*/
				const mediaRefMdl = {
					user_id: userInfo._id,
					id: profile.id.toUpperCase(),
					name: registerCred.authType.toUpperCase()
				};
				await this._authTxn.updateMediaRef(mediaRefMdl);
			}

			/*Check user is active in our system*/
			if (!userInfo.active || !userInfo.login_enabled) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W2);
			} else if (!RoleGroup.JOBSEEKER.includes(userInfo.role)) {
				/*Check user has specified role */
				return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
			}

			/*Issue application acccess token*/
			const appTokenRes = await this.generateToken(registerCred, userInfo);
			if (appTokenRes.code === 200) {
				if (!is_email_exists_db) {
					const sa_uri = this._appConfigSvc.get('app').sa_uri;
					const emailInfo = {
						filePath: '../../core/mail/templates/jobSeekerSelfReg.html',
						replacements: {
							fullName: profile.name,

							compName2: messages.G1,
							sa_uri: sa_uri,
							redirectUrl: `/home`
						},
						mailOptions: {
							to: profile.email,
							subject: `${messages.G1} | ${messages.M2}`,
							text: messages.T3
						}
					};
					await this.sendEmail(emailInfo);
				}
				return createResponse(HttpStatus.OK, messages.S11, { is_new_reg: !is_media_reg_db, ...appTokenRes.data });
			}
			return createResponse(HttpStatus.OK, messages.W17);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async googleRegister(registerCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			/*Generate google access token*/
			const tokenRes = await this.generateGoogleAccessToken(registerCred);
			if (tokenRes.code !== 200) return tokenRes;

			/*Fetch google profile*/
			const profileRes = await this.googleProfile(tokenRes.data.access_token);
			if (profileRes.code !== 200) return profileRes;
			const profile = (({ id, name, email, verified_email }) => ({ id, name, email, verified_email }))(profileRes.data);

			/*Validate profile and register*/
			return this.verifyAndRegister(registerCred, profile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E12);
		}
	}

	async linkedInRegister(registerCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			/*Generate linked in access token*/
			const tokenRes = await this.generateLinkedInAccessToken(registerCred);
			if (tokenRes.code !== 200) return tokenRes;
			const access_token = tokenRes.data.access_token;

			/*Fetch linked in profile*/
			const profileRes = await this.linkedInMe(access_token);
			if (profileRes.code !== 200) return profileRes;
			const profile = profileRes.data,
				/*Fetch linked in email address*/
				emailRes = await this.linkedInEmailAddress(access_token);
			if (emailRes.code !== 200) return emailRes;
			profile['email'] = emailRes.data.email;

			/*Validate profile and register*/
			return this.verifyAndRegister(registerCred, profile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E12);
		}
	}

	async facebookRegister(registerCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			/*Generate facebook access token*/
			const tokenRes = await this.generateFacebookAccessToken(registerCred);
			if (tokenRes.code !== 200) return tokenRes;

			/*Fetch facebook profile*/
			const profileRes = await this.facebookProfile(tokenRes.data.access_token);
			if (profileRes.code !== 200) return profileRes;
			const profile = (({ id, name, email }) => ({ id, name, email }))(profileRes.data);

			/*Validate profile and register*/
			return this.verifyAndRegister(registerCred, profile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E12);
		}
	}

	async twitterRegister(registerCred: AccessTokenPrincipal): Promise<AppResponse> {
		try {
			/*Generate twitter access token*/
			const tokenRes = await this.generateTwitterAccessToken(registerCred);
			if (tokenRes.code !== 200) return tokenRes;

			/*Fetch twitter profile*/
			const profileRes = await this.twitterProfile(tokenRes.data.access_token);
			if (profileRes.code !== 200) return profileRes;
			const profile = (({ id, name, email }) => ({ id, name, email }))(profileRes.data);

			/*Validate profile and register*/
			return this.verifyAndRegister(registerCred, profile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E12);
		}
	}

	async sendEmail(emailInfo: SendEmailDto) {
		let resFnRef: AppResponse;
		const emailDetail = await this._authTxn.getEmailDetails();
		const data = emailDetail?.data;
		const addCtus: any = {
			contactUs: data?.contactUs,
			contactEmail: data?.Email
		};
		if (emailInfo?.replacements?.redirectUrl || emailInfo?.replacements?.redirectUrl == '') {
			addCtus.redirectUrl = `${data?.uiUrl}${emailInfo?.replacements?.redirectUrl}`;
		}
		emailInfo.replacements = { ...emailInfo.replacements, ...addCtus };

		const file = join(__dirname, emailInfo.filePath),
			source = readFileSync(file, 'utf-8'),
			template = compile(source),
			replacements = emailInfo.replacements,
			htmlToSend = template(replacements),
			mailDetail: any = {
				from: emailInfo.mailOptions.from ? emailInfo.mailOptions.from : this._appConfigSvc.get('mailConfig').defaults.from.address,
				to: Array.isArray(emailInfo?.mailOptions?.to) ? emailInfo?.mailOptions?.to.join(',') : emailInfo?.mailOptions?.to,
				cc: emailInfo?.mailOptions?.cc
					? Array.isArray(emailInfo?.mailOptions?.cc)
						? emailInfo?.mailOptions?.cc.join(',')
						: emailInfo?.mailOptions?.cc
					: null,
				bcc: emailInfo?.mailOptions?.bcc
					? Array.isArray(emailInfo?.mailOptions?.bcc)
						? emailInfo?.mailOptions?.bcc.join(',')
						: emailInfo?.mailOptions?.bcc
					: null,
				sub: emailInfo.mailOptions.subject,
				body: htmlToSend,
				atch: emailInfo.replacements.atchUrls ? emailInfo.replacements.atchUrls : [],
				retry: 0
			};

		try {
			const mailOptions: ISendMailOptions = {
				to: emailInfo.mailOptions.to,
				subject: emailInfo.mailOptions.subject,
				html: htmlToSend,
				text: emailInfo.mailOptions.text
			};
			await this._mailService.sendEmail(mailOptions);
			resFnRef = createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			resFnRef = createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E14);
		}
		resFnRef.code === HttpStatus.OK ? (mailDetail.sts = EmailLogStatus.SENT) : (mailDetail.sts = EmailLogStatus.FAILED);
		this.logMail(mailDetail);
		return resFnRef;
	}
	async logMail(logDetail: any): Promise<void> {
		this._authTxn.createLogMail(logDetail);
	}
	//#region

	//#region Registration
	async register(registerCred: AccessTokenPrincipal): Promise<any> {
		try {
			switch (registerCred.authType.toLowerCase()) {
				case 'google':
					return this.googleRegister(registerCred);
				case 'linkedin':
					return this.linkedInRegister(registerCred);
				case 'facebook':
					return this.facebookRegister(registerCred);
				case 'twitter':
					return this.twitterRegister(registerCred);
				default:
					return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['authentication type']));
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.BAD_REQUEST, messages.E12);
		}
	}

	async verifyIdentityAndRegister(regDto: VerifyIdentityDto): Promise<any> {
		try {
			/*Verify and validate temporary token*/
			const options: TemporaryTokenModel = {
					token: regDto.token,
					// exp_ts: { $gt: unix_ts_now() }
					exp_ts: unix_ts_now()
				},
				tempTokenRes = await this._authTxn.fetchTempTokenInfo(options);
			if (!tempTokenRes) return createResponse(HttpStatus.BAD_REQUEST, messages.W18);
			if (!tempTokenRes.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W10);

			/*Verify OTP and get information*/
			const otpOptions: OtpTraceModel = {
					to: regDto.email,
					otp: regDto.otp,
					txn_id: regDto.txn_id,
					verified: false
				},
				otpRes = await this._authTxn.fetchOtpInfoByOtp(otpOptions);
			if (!otpRes) return createResponse(HttpStatus.BAD_REQUEST, messages.W19);

			/*Invalidate temporary token */
			const tempTokenSetOptions: TemporaryTokenModel = {
				token: regDto.token,
				// exp_ts: unix_ts_now(),
				data: null
			};
			await this._authTxn.invalidateTempToken(tempTokenSetOptions);

			/*Invalidate OTP */
			const otpSetOptions: OtpTraceModel = {
				user_id: otpRes._id,
				// exp_ts: unix_ts_now(),
				verified: true
			};
			await this._authTxn.invalidateOtp(otpSetOptions);

			/*Validate profile and register*/
			const profile = { email: regDto.email, ...JSON.parse(tempTokenRes.data) },
				registerCred: any = {
					authType: profile.authType,
					state: regDto.state
				};

			return this.verifyAndRegister(registerCred, profile);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E12);
		}
	}
	//#region

	//#region Employer Registration

	async checkMail(empMail: string): Promise<AppResponse> {
		try {
			const responce1 = await this._authTxn.getMail(empMail);
			if (responce1.code !== 200) return responce1;
			return createResponse(HttpStatus.OK, messages.S3, { type: 'mail', ...responce1.data });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async empRegister(empRegDetails: EmployerRegisterDto, ip: string): Promise<AppResponse> {
		try {
			const tempToken = await this.generateTempUniqueToken();
			const responce = await this.checkMail(empRegDetails.empMail);
			// const env = this._appConfigSvc.get('pwd');
			if (responce.code !== 200) return responce;

			const qurey: any = [
				{
					grp: MASTER_SCHEMA_GROUP.APPCON,
					active: true
				}
			];
			const genericData = await this._authTxn.getGenericMaster(qurey);

			let object = {};
			if (genericData?.data[0]?.data[0]?.value) {
				object = JSON.parse(genericData?.data[0]?.data[0]?.value);
			}

			/* verfiyLinkExpiry will be in day(s) */
			const verfiyLinkExpiry = object['activation_link_exp_days']
				? object['activation_link_exp_days'] * TimeConstants.MINUTES_IN_ONE_DAY
				: TimeConstants.MINUTES_IN_ONE_DAY;
			/* company_user_limit */
			empRegDetails.usersLimit = object['company_user_limit'] ? Number(object['company_user_limit']) : 0;
			/*employer_jsp_acc_till*/
			empRegDetails.accessTill = object['sub_dur_days']
				? unix_ts_now() + Number(object['sub_dur_days']) * TimeConstants.SECONDS_IN_DAY
				: unix_ts_now();
			/* js_profile_view_limit*/
			empRegDetails.profileLimit = object['profile_limit'] ? Number(object['profile_limit']) : 0;

			const result = await this._authTxn.postEmpRegister(empRegDetails, ip, tempToken, verfiyLinkExpiry);
			if (result.code !== 200) return result;
			const sa_uri = this._appConfigSvc.get('app').sa_uri;

			const emailInfo: SendEmailDto = {
					filePath: '../../core/mail/templates/empAccActivate.html',
					replacements: {
						redirectUrl: `/employerverifications?id=${tempToken}&isTrue=1`,
						compName2: messages.G1,
						sa_uri: sa_uri
					},
					mailOptions: {
						to: empRegDetails.empMail,
						subject: `${messages.G1} | ${messages.M3}`,
						text: messages.T4
					}
				},
				emailRes = await this.sendEmail(emailInfo);
			if (emailRes.code !== 200) return emailRes;
			return createResponse(HttpStatus.OK, messages.S9);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async generateTempToken(ip: string, empUrl: string): Promise<AppResponse> {
		try {
			const tokenMetadata = this._appConfigSvc.get('tokenMetadata');
			const myToken = {
				atExpiresIn: tokenMetadata.web.tempAt.expiresIn,
				appAtSecret: tokenMetadata.appTempAtSecret
			};
			const options: TemporaryTokenModel = {
				token: empUrl
			};
			const responce = await this._authTxn.fetchTempTokenInfoByToken(options);

			if (!responce.data) return createResponse(HttpStatus.BAD_REQUEST, messages.W15);
			if (responce.code !== 200) return responce;
			const data = responce.data;
			if (empUrl !== data.token) return createResponse(HttpStatus.BAD_REQUEST, messages.W15);
			const responce1 = await this._authTxn.getUser(data.user_id);
			if (responce1.code !== 206) return responce1;
			if (data.data === '1') return createResponse(HttpStatus.BAD_REQUEST, messages.W15);
			if (data.exp_ts <= unix_ts_now()) return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W14);
			const result = await this._authTxn.patchEmpMailVerify(data.user_id, empUrl);
			if (result.code !== 200) return result;
			const thisPayload: AtPayload = {
				sub: result.data._id,
				roles: [result.data.role],
				sid: new Types.ObjectId(),
				username: result.data.uname,
				name: result.data.name,
				ip_address: ip
			};
			const toeknRes = await this.generateAccessToken(thisPayload, myToken);
			if (toeknRes.code !== 200) return toeknRes;
			const response = {
				temp_token: toeknRes.data,
				user_info: result.data
			};
			return createResponse(HttpStatus.OK, messages.S3, response);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async empSetPassword(userClaims: any, empPassword: any): Promise<AppResponse> {
		try {
			const decryptRes = await this.decodePassword(empPassword.empPassword);
			if (decryptRes.code !== 200) return decryptRes;
			empPassword.empPassword = decryptRes.data.rawPwd;
			const user_id: string = userClaims.sub;
			const minPwdSize: number = this._appConfigSvc.get('pwd').maxPwdHistory;
			const dbRes = await this._authTxn.fetchPassword(user_id); //fetch all existing password of that current ID
			if (dbRes.code !== 200) return dbRes;
			const userPwd = dbRes.data[0].pwd;
			const resetPwdInfo = {
				operation: 'insert',
				user_id,
				newPwd: {
					hash: await hash(empPassword.empPassword, 12),
					created_at: unix_ts_now(),
					active: true
				}
			};
			if (userPwd.length >= minPwdSize) {
				resetPwdInfo.operation = 'update';
				userPwd.sort((currentObj: any, nextObj: any) => currentObj.created_at - nextObj.created_at);
				resetPwdInfo.newPwd['id'] = userPwd[0]._id;
			}
			const resultResponce = await this._authTxn.resetingPassword(resetPwdInfo); // Setting or reseting password
			if (resultResponce.code !== 200) return resultResponce;
			// if (userPwd || userPwd.length) {
			const result1 = await this._authTxn.patchEmpSetPassword(user_id, empPassword.token); //if new user, gratning login & active
			if (result1.code !== 200) return result1;
			// }
			if (result1.data.data === (RoleType.JOBSEEKER || RoleType.ADMINISTRATOR)) {
				const sa_uri = this._appConfigSvc.get('app').sa_uri;

				const emailInfo: SendEmailDto = {
						filePath: '../../core/mail/templates/jobSeekerSelfReg.html',
						replacements: {
							fullName: dbRes.data[0].name,

							compName2: messages.G1,
							sa_uri: sa_uri,
							redirectUrl: `/home`
						},
						mailOptions: {
							to: dbRes.data[0].uname,
							subject: `${messages.G1} | ${messages.M2}`,
							text: messages.T3
						}
					},
					emailRes = await this.sendEmail(emailInfo);
				if (emailRes.code !== 200) return emailRes;
			} else if (result1.data.data === RoleType.RECRUITER) {
				const sa_uri = this._appConfigSvc.get('app').sa_uri;
				const emailInfo: SendEmailDto = {
						filePath: '../../core/mail/templates/empSelfRegistration.html',
						replacements: {
							fullName: dbRes.data[0].name,

							compName2: messages.G1,
							sa_uri: sa_uri
						},
						mailOptions: {
							to: dbRes.data[0].uname,
							subject: `${messages.G1} | ${messages.M4}`,
							text: messages.T3
						}
					},
					emailRes = await this.sendEmail(emailInfo);
				if (emailRes.code !== 200) return emailRes;
			}
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async empDeclarationVerify(userClaims: AtPayload): Promise<AppResponse> {
		try {
			const user_id = userClaims.sub;
			const result = await this._authTxn.patchEmpDeclarationVerify(userClaims);
			if (result.code !== 200) return result;
			const responce1 = await this._authTxn.getUser(String(user_id));
			if (responce1.code !== 206) return responce1;

			const otpInfo = {
				ip: userClaims.ip_address,
				to: `${responce1?.data?.ci?.prim?.ph?.code}${responce1?.data?.ci?.prim?.ph?.val}`,
				channel: 'sms',
				user_id: responce1.data._id
			};
			const res = await this.sendOtp(otpInfo);
			if (res.code !== HttpStatus.OK) return res;
			const sa_uri = this._appConfigSvc.get('app').sa_uri;
			const emailInfo: SendEmailDto = {
					filePath: '../../core/mail/templates/empSelfRegistration.html',
					replacements: {
						fullName: responce1.data.name,

						compName2: messages.G1,
						sa_uri: sa_uri
					},
					mailOptions: {
						to: responce1.data.uname,
						subject: `${messages.G1} | ${messages.M4}`,
						text: messages.T3
					}
				},
				emailRes = await this.sendEmail(emailInfo);
			if (emailRes.code !== 200) return emailRes;
			const data = { mobile: responce1?.data?.ci?.prim?.ph?.val, ...res.data };
			return createResponse(HttpStatus.OK, messages.S3, data);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Upload file blob*/
	async uploadFileToBlob(blobInfo: blobInfo): Promise<AppResponse> {
		try {
			const blobData = this._appConfigSvc.get('blobStorage'),
				connString = blobData.blobAccountConnectionString,
				containerName = blobInfo.blobContainerName,
				blobServiceClient = BlobServiceClient.fromConnectionString(connString),
				blobContainer = blobServiceClient.getContainerClient(containerName),
				blobDirectory = blobInfo.dirName,
				fileName = blobContainer.getBlockBlobClient(`${blobDirectory}/${blobInfo.fileName}`),
				fileData = Buffer.from(blobInfo.file);
			const uploadRes = await fileName.uploadData(fileData);
			if (uploadRes?._response?.status !== HttpStatus.CREATED) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.E15);
			}
			return createResponse(HttpStatus.OK, messages.S3, blobInfo.fileName);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async jobSeekerSelfRegister(jsDetails: any): Promise<any> {
		try {
			const validDate = isValidDate(jsDetails?.jsDetails?.jsProfile?.dateofbirth);
			if (!validDate) return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W27, ['date of birth']));
			const decryptRes = await this.decodePassword(jsDetails.jsDetails.jsProfile.pwd);
			if (decryptRes.code !== 200) return decryptRes;
			jsDetails.pwd = decryptRes.data.rawPwd;
			let resumeName = '';
			let resumeBuffer: any = null;
			if (jsDetails?.files?.resume) {
				resumeName = `${unix_ts_now()}-${jsDetails?.files?.resume[0].originalname}`;
				resumeBuffer = jsDetails?.files?.resume[0].buffer;
			}

			let videoName = '';
			let videoBuffer: any = null;
			if (jsDetails?.files?.video) {
				videoName = `${unix_ts_now()}-${jsDetails?.files?.video[0].originalname}`;
				videoBuffer = jsDetails?.files?.video[0].buffer;
			}

			const userid = new Types.ObjectId();

			const blobData = this._appConfigSvc.get('blobStorage');
			try {
				if (resumeBuffer != null) {
					const resumeInfo = {
						blobContainerName: blobData.blobJobSeekerContainer,
						dirName: `${userid.toString()}/resume`,
						fileName: resumeName,
						file: resumeBuffer
					};
					await this.uploadFileToBlob(resumeInfo);
				}
			} catch (error) {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			}

			try {
				if (videoBuffer) {
					const videoInfo = {
						blobContainerName: blobData.blobJobSeekerContainer,
						dirName: `${userid.toString()}/video`,
						fileName: videoName,
						file: videoBuffer
					};
					await this.uploadFileToBlob(videoInfo);
				}
			} catch (error) {
				this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			}

			const modalData = jsDetails.jsDetails.jsProfile;

			const email = modalData.email;
			const fullName = modalData.fullName;
			modalData._id = userid;
			modalData.resumeName = resumeName;
			modalData.videoName = videoName;
			modalData.pwd = jsDetails.pwd;

			const response = await this.checkMail(email);
			if (response.code === 302) {
				return createResponse(HttpStatus.PARTIAL_CONTENT, response.message);
			} else {
				const dbRes = await this._authTxn.jobSeekerSelfRegister(modalData);
				if (dbRes.code == 200) {
					const sa_uri = this._appConfigSvc.get('app').sa_uri;

					const emailInfo: SendEmailDto = {
						filePath: '../../core/mail/templates/jobSeekerSelfReg.html',
						replacements: {
							fullName: fullName,
							compName2: messages.G1,
							sa_uri: sa_uri,
							redirectUrl: '/home'
						},
						mailOptions: {
							to: email,
							subject: `${messages.G1} | ${messages.M5}`,
							text: 'Registration'
						}
					};

					const mailRes = await this.sendEmail(emailInfo);
					if (mailRes.code == HttpStatus.OK) {
						return createResponse(HttpStatus.OK, messages.S11, userid);
					} else {
						return createResponse(HttpStatus.BAD_REQUEST, messages.E9);
					}
				} else {
					return createResponse(dbRes.code, dbRes.message);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion
	async forgetPwd(signInCred: ForgetPwdPrincipal): Promise<any> {
		try {
			/*Fetch user info*/
			let options: UserAccountModel = {};
			let usrInfo: any;
			signInCred.authType === 'email';
			if (signInCred.authType === 'email') {
				options = { uname: signInCred.to };
				usrInfo = await this._authTxn.fetchUsrInfoByuname(options);
				if (usrInfo.code !== HttpStatus.OK) return usrInfo;
				usrInfo = usrInfo?.data;
			} else {
				options = {
					ci: {
						prim: {
							ph: {
								val: signInCred.to.slice(3),
								code: signInCred.to.slice(0, 3)
							}
						}
					}
				};
				usrInfo = await this._authTxn.fetchUsrInfoByPhone(options);
				if (usrInfo.code !== HttpStatus.OK) return usrInfo;
				usrInfo = usrInfo?.data;
			}

			if (!usrInfo) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W10);
			}

			if (!usrInfo?.active) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W2);
			}

			/*Check user is exists in our db*/
			if (!usrInfo || !usrInfo.role) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W4);
			}
			if (signInCred.authType === 'email') {
				const options: SendOtpDto = {
					to: usrInfo.ci.prim.mail.val,
					ip: signInCred.ip,
					channel: signInCred.authType,
					user_id: usrInfo._id
				};
				const res = await this.sendOtp(options);
				if (res.code === 200) {
					const sendOtpRes = {
						commInfo: usrInfo.ci.prim.mail.val,
						txn_id: res.data.txn_id
					};
					return createResponse(HttpStatus.OK, messages.S5, sendOtpRes);
				} else {
					return res;
				}
			} else {
				const commData: SendOtpDto = {
					ip: signInCred.ip,
					to: `${usrInfo.ci.prim.ph.code}${usrInfo.ci.prim.ph.val}`,
					user_id: usrInfo._id,
					channel: signInCred.authType
				};
				const otpRes = await this.sendOtp(commData);
				if (otpRes.code === 200) {
					const sendOtpRes = {
						maskedTo: otpRes.data.masked_to,
						txn_id: otpRes.data.txn_id
					};
					return createResponse(HttpStatus.OK, messages.S5, sendOtpRes);
				} else {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W1);
				}
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W1);
		}
	}

	//#region Send OTP
	async sendOtpOverEmail(sendOtpDto: SendOtpDto): Promise<AppResponse> {
		try {
			/* The time step in otplib is determined based on the algorithm you choose for OTP generation. 
			The default algorithm used by otplib is the
			Time-Based One-Time Password (TOTP) algorithm, which typically has a time step of 30 seconds.
			So here we are setting the time step to 6 so the total time the otp will be valid for 6*30  
			around 180 sec or around 3 min  */
			const otpValidityInMin = this._appConfigSvc.get('otpSvc').otpValidityInMin;
			authenticator.options = {
				window: parseInt(otpValidityInMin) * 2
			};
			const secret = authenticator.generateSecret(128),
				otp = authenticator.generate(secret),
				/*OTP trace model*/
				otpTraceMdl: OtpTraceModel = {
					txn_id: secret,
					to: sendOtpDto.to,
					user_id: sendOtpDto.user_id ? new Types.ObjectId(sendOtpDto.user_id) : null,
					otp: Number(otp),
					ip: sendOtpDto.ip,
					exp_ts: unix_ts_now() + parseInt(otpValidityInMin) * 60
				};

			await this._authTxn.createOtpTrace(otpTraceMdl);
			/*Send OTP over email*/
			const sa_uri = this._appConfigSvc.get('app').sa_uri;
			const emailInfo: SendEmailDto = {
					filePath: '../../core/mail/templates/emailOtpVerification.html',
					replacements: {
						otpToSend: otp,

						compName2: messages.G1,
						sa_uri: sa_uri
					},
					mailOptions: {
						to: sendOtpDto.to,
						subject: `${messages.G1} | ${messages.M6}`,
						text: messages.T1
					}
				},
				emailRes = await this.sendEmail(emailInfo);
			if (emailRes.code !== 200) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W22);
			/*Log OTP traces*/

			return createResponse(HttpStatus.OK, messages.S5, { txn_id: secret, validityInMin: otpValidityInMin });
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W1);
		}
	}

	async sendOtpOverPhone(sendOtpDto: SendOtpDto): Promise<AppResponse> {
		try {
			const environment = this._appConfigSvc.get('app').environment.toLowerCase(),
				otpSvcCred = this._appConfigSvc.get('otpSvc');

			/* The time step in otplib is determined based on the algorithm you choose for OTP generation. 
			The default algorithm used by otplib is the
			Time-Based One-Time Password (TOTP) algorithm, which typically has a time step of 30 seconds.
			So here we are setting the time step to 6 so the total time the otp will be valid for 6*30  
			around 180 sec or around 3 min  */
			const otpValidityInMin = otpSvcCred.otpValidityInMin;
			authenticator.options = {
				window: parseInt(otpValidityInMin) * 2
			};
			const secret = authenticator.generateSecret(128),
				otp = authenticator.generate(secret),
				/*OTP trace model*/
				otpTraceMdl: OtpTraceModel = {
					txn_id: secret,
					to: sendOtpDto.to,
					user_id: sendOtpDto.user_id ? new Types.ObjectId(sendOtpDto.user_id) : null,
					otp: Number(otp),
					ip: sendOtpDto.ip,
					exp_ts: unix_ts_now() + parseInt(otpValidityInMin) * 60
				};

			const resp = await this._authTxn.createOtpTrace(otpTraceMdl);
			if (resp.code !== HttpStatus.OK) return resp;
			/*Ignore send  OTP when environment is development*/
			if (environment !== 'development') {
				const obj = {
					apikey: otpSvcCred.apiKey,
					numbers: sendOtpDto.to,
					message: messageFactory(messages.T5, [otp, otpValidityInMin]),
					sender: messages.T6,
					template: otpSvcCred.template
				};
				const axiosdata = stringify(obj),
					options = {
						method: 'POST',
						headers: { 'content-type': 'application/x-www-form-urlencoded' },
						data: axiosdata,
						url: `https://api.textlocal.in/send/`
					},
					restRes = await ext_api_call(options);
				if (restRes.status !== HttpStatus.OK || restRes.data.status.toLowerCase() === 'failure') {
					this._loggerSvc.error(restRes.data, HttpStatus.INTERNAL_SERVER_ERROR);
					return createResponse(HttpStatus.BAD_REQUEST, messages.W1);
				}
			}
			return createResponse(HttpStatus.OK, messages.S5, {
				masked_to: sendOtpDto.to.replace(/.(?=.{4,}$)/g, '*'),
				txn_id: otpTraceMdl.txn_id,
				validityInMin: otpValidityInMin
			});
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W1);
		}
	}

	async sendOtp(sendOtpDto: SendOtpDto): Promise<AppResponse> {
		try {
			switch (sendOtpDto.channel.toLowerCase()) {
				case 'sms':
					/*Send OTP over sms*/
					return this.sendOtpOverPhone(sendOtpDto);
				case 'email':
					/*Send OTP over email*/
					return this.sendOtpOverEmail(sendOtpDto);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['channel']));
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W22);
		}
	}

	async verifyOtp(verifyOtpDto: verifyOtpPrincipal): Promise<AppResponse> {
		try {
			switch (verifyOtpDto.channel.toLowerCase()) {
				case 'sms':
					/*Send OTP over sms*/
					return this.verifyPhoneOtp(verifyOtpDto);
				case 'email':
					/*Send OTP over email*/
					return this.verifyEmailOtp(verifyOtpDto);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['channel']));
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W22);
		}
	}

	async resendTempLink(userInfo: ResendActLinkDto, claims: AtPayload): Promise<AppResponse> {
		try {
			/*fetching user info*/
			const userId: UserAccountModel = { _id: userInfo.userId.toString() };
			const userRes = await this._authTxn.fetchUsrInfoByuserId(userId);

			/*validating*/
			if (!userRes.data) return userRes;
			const userDetail = userRes.data;
			if (userDetail.role === RoleType.SUPER_ADMINISTRATOR) return createResponse(HttpStatus.BAD_REQUEST, messages.W34);
			if (userDetail?.pwd?.length) return createResponse(HttpStatus.BAD_REQUEST, messages.W35);

			/*updateing logIn access*/
			if (!userDetail.login_enabled || userDetail.active) {
				const userDetails: UserAccountModel = {
					_id: `${userInfo.userId}`,
					login_enabled: true,
					active: false
				};
				const updateUserInfo = await this._authTxn.updateLoginAccess(userDetails, claims);
				if (updateUserInfo.code !== HttpStatus.OK) return updateUserInfo;
			}

			/*reading env file*/
			// const endDate = this._appConfigSvc.get('pwd');
			let verfiyLinkExpiry: any;

			const qurey: any = [
				{
					grp: MASTER_SCHEMA_GROUP.APPCON,
					active: true
				}
			];
			const genericData = await this._authTxn.getGenericMaster(qurey);
			if (!genericData?.data?.length || genericData.code !== HttpStatus.OK) return genericData;
			let object = genericData.data[0].data[0].value;
			object = JSON.parse(object);
			const matchingKey = Object.keys(object).find((key) => key.toLowerCase().includes('activation_link_exp_days'));
			if (matchingKey) {
				/* verfiyLinkExpiry will be in day(s) */

				verfiyLinkExpiry = object[matchingKey] * TimeConstants.MINUTES_IN_ONE_DAY;
			}

			/*createing temp token*/
			const tempToken = await this.generateTempUniqueToken();
			const emailId = userDetail.ci.prim.mail.val;
			const tempTokenInfo = {
				token: tempToken,
				user_id: userInfo.userId,
				ip: claims.ip_address,
				data: null,
				exp_ts: unix_ts_now() + Number(verfiyLinkExpiry) * 60,
				created_at: unix_ts_now()
			};
			const res = await this._authTxn.createTempToken(tempTokenInfo);
			if (res.code !== HttpStatus.OK) return res;

			/*send email*/
			const sa_uri = this._appConfigSvc.get('app').sa_uri;

			// const verifyUrl = `${emailtemp?.uiUrl}/employerverifications?id=${tempToken}&isTrue=1`;
			const emailInfo: SendEmailDto = {
				filePath: '../../core/mail/templates/empAccActivate.html',
				replacements: {
					redirectUrl: `/employerverifications?id=${tempToken}&isTrue=1`,
					compName2: messages.G1,
					sa_uri: sa_uri
				},
				mailOptions: {
					to: emailId,
					subject: `${messages.G1} | ${messages.M3}`,
					text: messages.T4
				}
			};
			const emailRes = await this.sendEmail(emailInfo);
			if (emailRes.code !== 200) return emailRes;
			return createResponse(HttpStatus.OK, messages.S14);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.sid.toString());
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
