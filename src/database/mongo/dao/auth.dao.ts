import { AppConfigService } from '@app/config/appconfig.service';
import { EmployerPermissionGroup } from '@app/core/enums/employer-permission.enum';
import { RegMode } from '@app/core/enums/reg-mode.enum';
import { RoleType } from '@app/core/enums/role-type.enum';
import AppLogger from '@app/core/logger/app-logger';
import { convert_date_unix_ts, unix_ts_now } from '@app/core/utils/timestamp.utils';
import { AbstractAuthDao } from '@app/database/mongo/abstract/auth.abstract';
import { AtPayload, RtPayload } from '@app/modules/auth/models/jwt-payload.model';
import { MailModel } from '@app/modules/auth/models/mail.model';
import { EmployerRegisterDto } from '@app/modules/auth/models/register-Employer.model';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { Inject } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { hash } from 'bcrypt';
import { Model, Types } from 'mongoose';
import { MongoConstants } from '../connection/constants.mongo';
import { AppSessionModel } from '../models/log.appsession.model';
import { OtpTraceModel } from '../models/otp-trace.model';
import { ProfileEmployerModel } from '../models/profile.employer.model';
import { UserAccountModel } from '../models/security.user-account.model';
import { TemporaryTokenModel } from '../models/temporary-token.model';
import { MASTER_SCHEMA_GROUP } from '../schemas/master.generic.schema';

export class AuthDao implements AbstractAuthDao {
	constructor(
		@Inject(MongoConstants.JOBSEEKER_PROFILE_SCHEMA) private readonly _jskSchema: Model<any>,
		@Inject(MongoConstants.USER_ACCOUNT_SCHEMA) private readonly _usrAccountSchema: Model<any>,
		@Inject(MongoConstants.APP_SESSION_SCHEMA) private readonly _appSessionSchema: Model<any>,
		@Inject(MongoConstants.OTP_TRACE_SCHEMA) private readonly _otpTraceSchema: Model<any>,
		@Inject(MongoConstants.TEMPORARY_TOKEN_SCHEMA) private readonly _tempTokenSchema: Model<any>,
		@Inject(MongoConstants.PROFILE_COMPANY_SCHEMA) private readonly _compProfileSchema: Model<any>,
		@Inject(MongoConstants.PROFILE_EMPLOYER_SCHEMA) private readonly _empProfileSchema: Model<any>,
		@Inject(MongoConstants.GENERIC_SCHEMA) private readonly _genericSchema: Model<any>,
		@Inject(MongoConstants.LOG_MAIL_SCHEMA) private readonly _logMailSchema: Model<any>,
		@Inject(MongoConstants.GENERIC_SCHEMA) private readonly _masterGenericSchema: Model<any>,
		@Inject(MongoConstants.LOG_SUBSCRIPTION_SCHEMA) private readonly _logSubcriptionSchema: Model<any>,
		readonly _loggerSvc: AppLogger,
		private readonly _appConfigSvc: AppConfigService
	) {}

	async userNameExists(options: UserAccountModel): Promise<any> {
		try {
			const dbRes = await this._usrAccountSchema.exists({
				uname: options.uname
			});
			if (dbRes) return true;
			return false;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return true;
		}
	}

	async phoneExists(options: any): Promise<boolean> {
		try {
			const dbRes = await this._usrAccountSchema.exists({
				'ci.prim.ph.val': options.ci.prim.ph.val,
				'ci.prim.ph.code': options.ci.prim.ph.code
			});
			if (dbRes && options.profile?.dob_ts) {
				const res = await this._jskSchema.exists({
					user_id: dbRes._id,
					'profile.dob_ts': options.profile?.dob_ts
				});
				if (res) return true;
			} else {
				if (dbRes) return true;
			}

			return false;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return true;
		}
	}

	async markEmailVerified(emailDet: UserAccountModel): Promise<AppResponse> {
		try {
			await this._usrAccountSchema.updateOne(
				{ _id: new Types.ObjectId(emailDet._id) },
				{
					$set: {
						'ci.prim.mail.val': emailDet.ci.prim.mail.val,
						'ci.prim.mail.iv': emailDet.ci.prim.mail.iv
					}
				}
			);

			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
		}
	}

	async fetchUsrInfoByPhone(options: UserAccountModel): Promise<any> {
		try {
			let dbRes;
			if (options?.role)
				dbRes = await this._usrAccountSchema.findOne({
					'ci.prim.ph.code': options.ci.prim.ph.code,
					'ci.prim.ph.val': options.ci.prim.ph.val,
					role: options.role
				});
			else
				dbRes = await this._usrAccountSchema.findOne({
					'ci.prim.ph.code': options.ci.prim.ph.code,
					'ci.prim.ph.val': options.ci.prim.ph.val
				});

			if (dbRes) {
				return createResponse(HttpStatus.OK, messages.S3, dbRes);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W10);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchUsrInfoByuserId(userId: UserAccountModel): Promise<AppResponse> {
		try {
			const dbRes = await this._usrAccountSchema.findOne({
				_id: new Types.ObjectId(userId._id)
			});
			if (dbRes) {
				return createResponse(HttpStatus.OK, messages.S3, dbRes);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W10);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchUsrInfoByuname(option: UserAccountModel): Promise<AppResponse> {
		try {
			const dbRes = await this._usrAccountSchema.findOne({
				uname: { $regex: `^${option.uname}`, $options: 'i' }
			});
			if (dbRes) {
				return createResponse(HttpStatus.OK, messages.S3, dbRes);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W10);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchUsrInfoBySocNtw(option: UserAccountModel): Promise<any> {
		try {
			const dbRes = await this._usrAccountSchema.findOne({
				soc_net: {
					$elemMatch: {
						id: option.soc_net.id.toUpperCase(),
						name: option.soc_net.name.toUpperCase()
					}
				}
			});
			return createResponse(HttpStatus.OK, messages.S3, dbRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchUsrVerifyReg(option: UserAccountModel): Promise<AppResponse> {
		try {
			const dbRes = await this._usrAccountSchema.findOne({
				uname: option.uname?.toLowerCase()
			});
			return createResponse(HttpStatus.OK, messages.S3, dbRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async createSession(session: AppSessionModel): Promise<any> {
		try {
			await this._appSessionSchema.create({
				...session
			});
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async findSessionBySid(sessionInfo: RtPayload): Promise<AppResponse> {
		try {
			const dbRes = await this._appSessionSchema.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(sessionInfo.sid),
						user_id: new Types.ObjectId(sessionInfo.sub),
						end_ts: { $gt: unix_ts_now() }
					}
				},
				{
					$lookup: {
						from: 'SecurityUserAccounts',
						localField: 'user_id',
						foreignField: '_id',
						as: 'user_info'
					}
				},
				{
					$unwind: '$user_info'
				},
				{
					$project: {
						_id: 1,
						user_id: 1,
						role: 1,
						start_ts: 1,
						end_ts: 1,
						device: 1,
						ip: 1,
						user_info: {
							name: '$user_info.name',
							username: '$user_info.uname',
							role: '$user_info.role',
							permission: '$user_info.prm',
							active: 1,
							login_enabled: 1
						}
					}
				}
			]);

			if (dbRes && dbRes.length > 0) {
				const sessionInfo = dbRes[0];
				/*Check user is active*/
				if (!sessionInfo.user_info.active || !sessionInfo.user_info.login_enabled) {
					return createResponse(HttpStatus.UNAUTHORIZED, messages.W2);
				}
				return createResponse(HttpStatus.OK, messages.S3, dbRes[0]);
			}
			return createResponse(HttpStatus.UNAUTHORIZED, messages.W6);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateSession(sessionInfo: any): Promise<any> {
		try {
			await this._appSessionSchema.updateOne(
				{
					_id: new Types.ObjectId(sessionInfo._id)
				},
				{
					$set: { end_ts: sessionInfo.end_ts },
					$push: sessionInfo.ipAddress ? sessionInfo.ipAddress : {}
				}
			);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async logoutSession(sessionId: any): Promise<any> {
		try {
			await this._appSessionSchema.updateOne(
				{
					_id: new Types.ObjectId(sessionId.sid)
				},
				{
					$set: { end_ts: unix_ts_now() }
				}
			);
			return createResponse(HttpStatus.OK, messages.S4);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, sessionId.sid);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region Jobseeker registration
	async setUpUserAccount(accountInfo: any): Promise<AppResponse> {
		try {
			/*Setup user account*/
			const userAcRes = await this._usrAccountSchema.create({ ...accountInfo });
			/*Create corresponding jobseeker profile*/
			await this._jskSchema.create({
				user_id: accountInfo._id,
				profile: {
					name: accountInfo.name
				}
			});
			return createResponse(HttpStatus.OK, messages.S3, userAcRes);
		} catch (error) {
			await this._usrAccountSchema.deleteOne({ _id: new Types.ObjectId(accountInfo._id) });
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Insert new media reference*/
	async updateMediaRef(mediaRefMdl: any): Promise<AppResponse> {
		try {
			await this._usrAccountSchema.updateOne(
				{
					_id: new Types.ObjectId(mediaRefMdl.user_id)
				},
				// {
				// 	$push: {
				// 		media_ref: {
				// 			ref_id: mediaRefMdl.ref_id,
				// 			name: mediaRefMdl.name,
				// 			created_at: unix_ts_now()
				// 		}
				// 	}
				// }
				{
					$push: {
						soc_net: {
							id: mediaRefMdl.id.toUpperCase(),
							name: mediaRefMdl.name.toUpperCase(),
							created_at: unix_ts_now()
						}
					}
				}
			);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async createTempToken(tempSssionMdl: TemporaryTokenModel): Promise<AppResponse> {
		try {
			await this._tempTokenSchema.updateMany(
				{ user_id: new Types.ObjectId(tempSssionMdl.user_id), exp_ts: { $gt: unix_ts_now() } },
				{ $set: { exp_ts: unix_ts_now() } }
			);
			await this._tempTokenSchema.create({ ...tempSssionMdl });
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
	async createOtpTrace(otpTraceMdl: OtpTraceModel): Promise<AppResponse> {
		try {
			/*used to expire all existing active OTP for the traget communication*/
			await this._otpTraceSchema.updateMany({ to: otpTraceMdl.to, exp_ts: { $gt: unix_ts_now() } }, { $set: { exp_ts: unix_ts_now() } });
			/*used to saves OTP details in DB*/
			await this._otpTraceSchema.create({
				txn_id: otpTraceMdl.txn_id,
				user_id: new Types.ObjectId(otpTraceMdl.user_id),
				otp: otpTraceMdl.otp,
				to: otpTraceMdl.to,
				ip: otpTraceMdl.ip,
				exp_ts: otpTraceMdl.exp_ts
			});
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region Reset Password
	async fetchPassword(id: any): Promise<AppResponse> {
		try {
			const usersPwd = await this._usrAccountSchema.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(id)
					}
				},
				{
					$project: {
						_id: 0,
						pwd: 1,
						uname: 1,
						name: 1
					}
				}
			]);
			if (!usersPwd.length) return createResponse(HttpStatus.BAD_REQUEST, messages.W10);
			return createResponse(HttpStatus.OK, messages.S3, usersPwd);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async resetingPassword(resetPwdInfo: any): Promise<AppResponse> {
		try {
			let updateRes1;
			const updateRes = await this._usrAccountSchema.updateOne(
				{
					_id: new Types.ObjectId(resetPwdInfo.user_id),
					'pwd.active': true
				},
				{
					$set: {
						'pwd.$.active': false
					}
				}
			);
			if (resetPwdInfo.operation === 'insert') {
				updateRes1 = await this._usrAccountSchema.updateOne(
					{
						_id: new Types.ObjectId(resetPwdInfo.user_id)
					},
					{
						$push: {
							pwd: resetPwdInfo.newPwd
						}
					}
				);
			} else {
				updateRes1 = await this._usrAccountSchema.updateOne(
					{
						_id: new Types.ObjectId(resetPwdInfo.user_id)
					},
					{
						$set: {
							'pwd.$[elementPwd]': {
								hash: resetPwdInfo.newPwd.hash,
								created_at: resetPwdInfo.newPwd.created_at,
								active: resetPwdInfo.newPwd.active
							}
						}
					},
					{
						arrayFilters: [
							{
								'elementPwd._id': resetPwdInfo.newPwd.id
							}
						]
					}
				);
			}
			if (updateRes.acknowledged && updateRes1.acknowledged) {
				return createResponse(HttpStatus.OK, messages.S3);
			} else {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			}
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async updateOtpVerified(txn_id: string): Promise<any> {
		try {
			await this._otpTraceSchema.updateOne(
				{
					txn_id: txn_id
				},
				{
					$set: { verified: true, exp_ts: unix_ts_now() }
				}
			);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async markPhNoVerified(contactInfo: UserAccountModel): Promise<AppResponse> {
		try {
			await this._usrAccountSchema.updateOne(
				{ _id: new Types.ObjectId(contactInfo._id) },
				{
					$set: {
						'ci.prim.ph.code': contactInfo.ci.prim.ph.code,
						'ci.prim.ph.val': contactInfo.ci.prim.ph.val,
						'ci.prim.ph.iv': true
					}
				}
			);
			await this._usrAccountSchema.updateMany(
				{
					_id: { $ne: new Types.ObjectId(contactInfo._id) },
					'ci.prim.ph.code': contactInfo.ci.prim.ph.code,
					'ci.prim.ph.val': contactInfo.ci.prim.ph.val,
					'ci.prim.ph.iv': true
				},
				{
					$set: {
						'ci.prim.ph.iv': false
					}
				}
			);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.BAD_REQUEST, messages.E2);
		}
	}

	//#region Employer Registration
	async getUser(user_id: string): Promise<AppResponse> {
		try {
			const isUser = await this._usrAccountSchema.findOne({ _id: new Types.ObjectId(user_id) });
			if (!isUser.length) return createResponse(HttpStatus.PARTIAL_CONTENT, messages.W13, isUser);
			return createResponse(HttpStatus.OK, messages.S3, isUser);
		} catch (error: any) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getMail(mail: string): Promise<AppResponse> {
		try {
			const isMail = await this._usrAccountSchema.findOne({ uname: mail }, { _id: 0, uname: 1, role: 1 });
			if (isMail) return createResponse(HttpStatus.FOUND, messages.W13, { type: 'mail', ...isMail });
			return createResponse(HttpStatus.OK, messages.S3, isMail);
		} catch (error: any) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async setEmpProfile(empProfile): Promise<AppResponse> {
		try {
			const resp = await this._empProfileSchema.create(empProfile);

			if (!resp) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			return createResponse(HttpStatus.OK, messages.S3, resp);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async postEmpRegister(empRegDetails: EmployerRegisterDto, ip: string, tempToken: string, min: number): Promise<AppResponse> {
		try {
			const expieryDate = unix_ts_now() + Number(min) * 60,
				time = unix_ts_now(),
				id = new Types.ObjectId(),
				comp_id = new Types.ObjectId();

			const result1 = await this._compProfileSchema.create({
				_id: comp_id,
				/*Organization profile information*/
				profile: {
					name: empRegDetails.empCompany,
					ind: empRegDetails.empType,
					poc: {
						name: empRegDetails.empName,
						role: empRegDetails.empDesignation,
						ph: {
							prim: {
								code: empRegDetails.empPhoneCode,
								val: empRegDetails.empPhoneNo
							}
						}
					},
					adr: {
						street: empRegDetails.empAddress,
						zip: empRegDetails.empPin
					}
				},
				settings: {
					users: empRegDetails.usersLimit,
					till: empRegDetails.accessTill,
					from: unix_ts_now(),
					bl: empRegDetails.profileLimit
				},

				created_at: unix_ts_now()
			});
			if (!result1) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);

			const userInfo = {
				_id: id,
				uname: empRegDetails.empMail,
				name: empRegDetails.empName,
				ci: {
					prim: {
						ph: {
							code: empRegDetails.empPhoneCode,
							val: empRegDetails.empPhoneNo,
							iv: false
						},
						mail: {
							val: empRegDetails.empMail,
							iv: false
						}
					}
				},
				role: RoleType.EMPLOYER_ADMINISTRATOR,
				reg_mode: RegMode.CREDENTIALS,
				prm: [...EmployerPermissionGroup.ALL_EMP_PERMISSION],
				login_enabled: true,
				active: false,
				created_by: id,
				created_at: time
			};
			const result2: any = await this.setUpUserAccount(userInfo);
			if (!result2) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			const user_details = result2.data;
			const empProfile: ProfileEmployerModel = {
				user_id: user_details._id,
				co_id: comp_id,
				name: empRegDetails.empName,
				role: empRegDetails.empDesignation,
				prm: [...EmployerPermissionGroup.ALL_EMP_PERMISSION],
				rmid: null,
				created_by: id,
				created_at: time
			};

			const result3 = await this.setEmpProfile(empProfile);
			if (result3.code !== HttpStatus.OK) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);

			const result4 = await this._logSubcriptionSchema.create({
				co_id: comp_id,
				from: unix_ts_now(),
				till: empRegDetails.accessTill,
				curr_bl: empRegDetails.profileLimit,
				avil_bl: empRegDetails.profileLimit,
				updated_by: id,
				created_at: unix_ts_now()
			});
			if (!result4) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);

			const tokenInfo = {
				token: tempToken,
				user_id: new Types.ObjectId(result2.data._id),
				ip: ip,
				exp_ts: expieryDate
			};
			const responce: any = await this.createTempToken(tokenInfo);
			if (responce.code !== HttpStatus.OK) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			return createResponse(HttpStatus.OK, messages.S3, responce.acctActivationCode);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion Employer Registration

	/*Fetch temporary token information*/
	async fetchTempTokenInfo(options: TemporaryTokenModel): Promise<any> {
		try {
			const dbRes = await this._tempTokenSchema.findOne(
				{
					token: options.token,
					exp_ts: { $gt: options.exp_ts }
				},
				{ data: 1 }
			);
			return dbRes;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchTempTokenInfoByToken(options: TemporaryTokenModel): Promise<any> {
		try {
			const dbRes = await this._tempTokenSchema.findOne({
				token: options.token
			});
			return createResponse(HttpStatus.OK, messages.S3, dbRes);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Kill temp token session*/
	async invalidateTempToken(options: TemporaryTokenModel): Promise<AppResponse> {
		try {
			await this._tempTokenSchema.updateOne({
				filter: {
					token: options.token
				},
				set: {
					exp_ts: unix_ts_now(),
					data: null
				}
			});
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Fetch OTP information*/
	async fetchOtpInfo(options: OtpTraceModel): Promise<AppResponse> {
		try {
			const dbRes = await this._otpTraceSchema.findOne(
				{
					txn_id: options.txn_id
				},
				{ _id: 1, user_id: 1 }
			);
			if (dbRes) {
				return createResponse(HttpStatus.OK, messages.S3, dbRes);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W11, ['transaction id']));
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchOtpInfoByOtp(options: OtpTraceModel): Promise<any> {
		try {
			const dbRes = await this._otpTraceSchema.findOne(
				{
					to: options?.to?.toLowerCase(),
					otp: options.otp,
					exp_ts: { $gt: unix_ts_now() },
					txn_id: options.txn_id,
					verified: options.verified
				},
				{ _id: 1, user_id: 1 }
			);
			return dbRes;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchOtpInfoBytxnId(options: OtpTraceModel): Promise<any> {
		try {
			const dbRes = await this._otpTraceSchema.findOne(
				{
					to: options?.to?.toLowerCase(),
					txn_id: options.txn_id,
					exp_ts: { $gt: unix_ts_now() },
					verified: options.verified
				},
				{ _id: 1, user_id: 1, txn_id: 1 }
			);
			return dbRes;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	/*Kill OTP session*/
	async invalidateOtp(options: OtpTraceModel): Promise<AppResponse> {
		try {
			await this._otpTraceSchema.updateOne(
				{
					txn_id: options.txn_id
				},
				{
					$set: {
						exp_ts: unix_ts_now(),
						verified: true
					}
				}
			);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region Employer Registration
	async patchEmpMailVerify(id: string): Promise<AppResponse> {
		try {
			const responce1 = await this._usrAccountSchema.updateOne({ _id: new Types.ObjectId(id) }, { 'ci.prim.mail.iv': true });
			if (!responce1.acknowledged) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			const result = await this._usrAccountSchema.findOne(
				{ _id: new Types.ObjectId(id) },
				{
					_id: 1,
					name: 1,
					uname: 1,
					role: 1
				}
			);
			return createResponse(HttpStatus.OK, messages.S3, result);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async patchEmpSetPassword(id: string, token: string): Promise<AppResponse> {
		try {
			const reaponce = await this._usrAccountSchema.updateOne(
				{ _id: new Types.ObjectId(id) },
				{
					active: true
				}
			);
			const responce3 = await this._tempTokenSchema.findOne({ token: token });
			if (!reaponce.acknowledged) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			const responce2 = await this._tempTokenSchema.updateOne({ token: token }, { exp_ts: unix_ts_now(), data: '1' });
			if (!responce2.acknowledged) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			return createResponse(HttpStatus.OK, messages.S3, responce3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async patchEmpDeclarationVerify(claims: AtPayload): Promise<AppResponse> {
		try {
			const emp = await this._empProfileSchema.findOne({ user_id: new Types.ObjectId(claims.sub) });
			if (!emp) return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W39));
			const responce = await this._compProfileSchema.updateOne({ _id: emp.co_id }, { tc: true });
			if (!responce.acknowledged) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async patchEmpPhoneVerify(id: string, phoneDetails?: any): Promise<AppResponse> {
		try {
			let responce;
			if (phoneDetails?.empPhoneCode && phoneDetails?.empPhoneNo) {
				responce = await this._usrAccountSchema.updateOne(
					{ _id: new Types.ObjectId(id) },
					// {
					// 	contact: {
					// 		code: phoneDetails?.empPhoneCode,
					// 		phno: phoneDetails?.empPhoneNo
					// 	},
					// 	ph_verified: true
					// }
					{
						$set: {
							'ci.prim.ph.code': phoneDetails?.empPhoneCode,
							'ci.prim.ph.val': phoneDetails?.empPhoneNo,
							'ci.prim.ph.iv': true
						}
					}
				);
			} else {
				responce = await this._usrAccountSchema.updateOne({ _id: new Types.ObjectId(id) }, { 'ci.prim.ph.iv': true });
			}
			if (!responce.acknowledged) return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion Employer Registration

	async jobSeekerSelfRegister(jsDetails: any): Promise<AppResponse> {
		try {
			await this._usrAccountSchema.create({
				_id: jsDetails._id,
				uname: jsDetails.email,
				name: jsDetails.fullName,
				ci: {
					prim: {
						ph: {
							code: jsDetails.country_code,
							val: jsDetails.phno,
							iv: false
						},
						mail: {
							val: jsDetails.email,
							iv: false
						}
					}
				},
				pwd: [
					/*Password*/
					{
						hash: await hash(jsDetails.pwd, 12),
						created_at: unix_ts_now(),
						active: true
					}
				],
				role: RoleType.JOBSEEKER,
				reg_mode: RegMode.CREDENTIALS,
				login_enabled: true,
				active: true,
				created_by: jsDetails._id,
				created_at: unix_ts_now(),
				updated_at: unix_ts_now()
			});
			await this._jskSchema.create({
				user_id: jsDetails._id,
				profile: {
					name: jsDetails.fullName,
					dob_ts: convert_date_unix_ts(jsDetails.dateofbirth),
					ci: [{ ccode: '', acode: '', ph: '' }],
					loc: { city: jsDetails.currentcity, state: '', country: jsDetails.currentcountry },
					siv: {
						name: jsDetails.videoName /*File name with extension*/,
						updated_at: unix_ts_now()
					}
				},
				'cp.fresher': jsDetails.fresher,
				lang: [],
				'cp.cv': { name: jsDetails.resumeName, updated_at: unix_ts_now() },
				created_at: unix_ts_now(),
				updated_at: unix_ts_now()
			});
			return createResponse(HttpStatus.OK, messages.S11);
		} catch (error) {
			await this._usrAccountSchema.deleteOne({ _id: new Types.ObjectId(jsDetails._id) });
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async fetchEmployerProfile(options: ProfileEmployerModel): Promise<AppResponse> {
		try {
			const dbRes = await this._empProfileSchema.aggregate([
				{
					$match: {
						user_id: new Types.ObjectId(options.user_id)
					}
				},
				{
					$lookup: {
						from: 'ProfileCompanies',
						localField: 'co_id',
						foreignField: '_id',
						as: 'companyInfo'
					}
				},
				{
					$unwind: {
						path: '$companyInfo'
					}
				},
				{
					$match: {
						'companyInfo.active': true
					}
				},
				{
					$project: {
						_id: 0,
						company_id: '$co_id',
						tc_accepted: '$companyInfo.tc',
						accessability: '$a11y'
					}
				}
			]);
			if (dbRes.length) {
				return createResponse(HttpStatus.OK, messages.S3, dbRes[0]);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W33);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async updateLoginAccess(userInfo: UserAccountModel, claims: AtPayload): Promise<AppResponse> {
		try {
			await this._usrAccountSchema.updateOne(
				{ _id: new Types.ObjectId(userInfo._id) },
				{ login_enabled: userInfo.login_enabled, active: userInfo.active }
			);
			return createResponse(HttpStatus.OK, messages.S3);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, `${claims.sid}`);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	async getEmailDetails(): Promise<AppResponse> {
		try {
			const dbRes = await this._genericSchema.aggregate([
				{
					$match: {
						grp: MASTER_SCHEMA_GROUP.CTUS
					}
				},
				{
					$project: {
						_id: 0,
						e_details: '$name'
					}
				}
			]);

			const data = JSON.parse(dbRes[0]?.e_details);
			const mails = data?.mail?.secd?.length > 0 ? `${data.mail.prim} | ${data.mail.secd.join(' | ')}` : data.mail.prim;
			const phone = data?.ph?.secd?.length > 0 ? `${data.ph.prim} | ${data.ph.secd.join(' | ')}` : data.ph.prim;
			const uri = this._appConfigSvc.get('emailTemplate').uiUrl;
			const emailData = {
				contactUs: phone,
				Email: mails,
				uiUrl: uri
			};
			return createResponse(HttpStatus.OK, messages.S4, emailData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	async createLogMail(logDetails: MailModel): Promise<void> {
		try {
			await this._logMailSchema.create({
				from: logDetails.from,
				to: logDetails.to,
				cc: logDetails?.cc ? logDetails.cc : null,
				bcc: logDetails?.bcc ? logDetails.bcc : null,
				sub: logDetails.sub,
				body: logDetails.body,
				atch: logDetails?.atch ? logDetails?.atch : null,
				sts: logDetails.sts,
				retry: logDetails.retry
			});
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	//#endregion

	async getGenericMaster(options: any): Promise<AppResponse> {
		try {
			const resData = await this._masterGenericSchema.aggregate([
				{
					$match: {
						$or: options
					}
				},
				{ $group: { _id: '$grp', data: { $push: { value: '$$ROOT.name', id: '$$ROOT._id', desc: '$$ROOT.desc' } } } },

				{ $project: { _id: 0, group: '$_id', data: 1 } }
			]);
			return createResponse(HttpStatus.OK, '', resData);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
}
