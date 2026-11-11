import { Authorize, TempAuthorize } from '@app/core/decorators/authorization.decorator';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { AbstractAuthSvc } from './auth.abstract';
import {
	AccessTokenPrincipalDto,
	EmployerPasswordDto,
	EmployerRegisterDto,
	ForgetPwdDto,
	JobSeekerSelfRegDto,
	OtpSignInDto,
	RefreshTokenPrincipalDto,
	ResetPasswordDto,
	SendOTPDto,
	SocialMediaAccessTokenPrincipalDto,
	VerifyForgetPwdDto,
	VerifyIdentityDto,
	VerifyOtpDto,
	VerifyOtpPrincipalDto
} from './dto';
import { ExistDto, ResendActLinkDto } from './dto/auth.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly _authSvc: AbstractAuthSvc) {}

	@Post('admin-signin')
	async adminSignIn(@Req() req: any, @Headers() header: any, @Body() userCred: AccessTokenPrincipalDto): Promise<AppResponse> {
		/* header validation*/
		const requiredHeader = { key: 'content-type', value: 'application/x-www-form-urlencoded' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		userCred.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		userCred.state['ip'] = header['x-original-forwarded-for'];
		const signInCred: any = { ...userCred };
		return this._authSvc.adminSignIn(signInCred);
	}

	@Post('js-signin')
	async jobSeekerSignIn(@Req() req: any, @Headers() header: any, @Body() userCred: AccessTokenPrincipalDto): Promise<AppResponse> {
		/*header validation*/
		const requiredHeader = { key: 'content-type', value: 'application/x-www-form-urlencoded' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		userCred.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		userCred.state['ip'] = header['x-original-forwarded-for'];
		const signInCred: any = { ...userCred };
		return this._authSvc.jobseekerSignIn(signInCred);
	}

	@Post('social-media-signin')
	async socialMediaSignIn(@Req() req: any, @Headers() header: any, @Body() userCred: SocialMediaAccessTokenPrincipalDto): Promise<AppResponse> {
		/*header validation*/
		const requiredHeader = { key: 'content-type', value: 'application/x-www-form-urlencoded' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		userCred.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		userCred.state['ip'] = header['x-original-forwarded-for'];
		const signInCred: any = { ...userCred };
		return this._authSvc.socialMediaSignIn(signInCred);
	}

	@Post('employer-signin')
	async employerSignIn(@Req() req: any, @Headers() header: any, @Body() userCred: AccessTokenPrincipalDto): Promise<AppResponse> {
		/* header validation*/
		const requiredHeader = { key: 'content-type', value: 'application/x-www-form-urlencoded' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		userCred.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		userCred.state['ip'] = header['x-original-forwarded-for'];
		const signInCred: any = { ...userCred };
		return this._authSvc.employerSignIn(signInCred);
	}

	@Post('refresh-token')
	async refreshToken(@Headers() header: any, @Body() userCred: RefreshTokenPrincipalDto): Promise<AppResponse> {
		const ip = header['x-original-forwarded-for'];
		userCred.state['ip'] = ip;
		const authCred: any = { ...userCred };
		return this._authSvc.refreshToken(authCred);
	}

	@Authorize()
	@Patch('logout')
	logout(@Req() req: any): Promise<AppResponse> {
		return this._authSvc.logout(req.claims);
	}

	@Post('otp-signin')
	async otpSignIn(@Headers() header: any, @Body() commData: OtpSignInDto): Promise<AppResponse> {
		const ip = header['x-original-forwarded-for'];
		commData['ip'] = ip;
		const otpInfo: any = { ...commData };
		return this._authSvc.otpSignIn(otpInfo);
	}

	@Post('verify-otp-generate-token')
	async verifyAndCreateToken(@Req() req: any, @Headers() header: any, @Body() commData: VerifyOtpPrincipalDto): Promise<AppResponse> {
		const agentType = req.headers['user-agent'].toLowerCase(),
			ip = header['x-original-forwarded-for'];
		commData.state['agent_type'] = agentType;
		commData.state['ip'] = ip;
		const otpInfo: any = { ...commData };
		return this._authSvc.verifyAndCreateToken(otpInfo);
	}

	//#region update password
	@Patch('reset-password')
	@Authorize()
	@ApiBearerAuth()
	async resetPassword(@Req() req: any, @Body() resetPwdDetails: ResetPasswordDto): Promise<AppResponse> {
		return this._authSvc.resetPassword(req.claims, resetPwdDetails);
	}
	//#endregion

	//#region Register using social media
	@Post('js-register')
	async jobSeekerRegister(@Req() req: any, @Headers() header: any, @Body() userCred: SocialMediaAccessTokenPrincipalDto): Promise<AppResponse> {
		userCred.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		userCred.state['ip'] = header['x-original-forwarded-for'];
		const regCred: any = { ...userCred };
		return this._authSvc.register(regCred);
	}

	@Post('verify-otp-register')
	async verifyIdentityAndRegister(@Req() req: any, @Headers() header: any, @Body() regDto: VerifyIdentityDto): Promise<AppResponse> {
		regDto.state['agent_type'] = req.headers['user-agent'].toLowerCase();
		regDto.state['ip'] = header['x-original-forwarded-for'];
		const regInfo: any = { ...regDto };
		return this._authSvc.verifyIdentityAndRegister(regInfo);
	}
	//#endregion

	// #jobseeker self registration.
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: 'resume', maxCount: 1 },
				{ name: 'video', maxCount: 1 }
			],
			{
				limits: { fileSize: 20971520 }
			}
		)
	)
	@Post('js-self-register')
	async jobSeekerSelfRegister(
		@Headers() header: any,
		@Body() jsDetails: JobSeekerSelfRegDto,
		@UploadedFiles()
		files: { resume?: Express.Multer.File[]; video?: Express.Multer.File[] }
	) {
		/* header validation*/
		const requiredHeader = { key: 'content-type', value: 'multipart/form-data' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		const jsObject = {
			files,
			jsDetails: jsDetails
		};
		if (files?.resume && files?.resume?.length && files?.resume[0]?.size > 2097152) {
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W41, ['resume', '2MB']));
		}
		if (files?.video && files?.video.length && files?.video[0]?.size > 20971520) {
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W41, ['video', '20MB']));
		}
		if (
			files?.resume &&
			files?.resume.length &&
			!/^application\/(pdf|docx|vnd.openxmlformats-officedocument.wordprocessingml.document)$/i.test(files?.resume[0]?.mimetype)
		) {
			return createResponse(206, messages.W26);
		}
		if (files?.video && files?.video.length && !/^video\/(mp4|x-matroska|x-m4v)$/i.test(files?.video[0]?.mimetype)) {
			return createResponse(206, messages.W25);
		}
		return this._authSvc.jobSeekerSelfRegister(jsObject);
	}

	@Post('verify-otp-generate-temp-token')
	async verifyForgetPwd(@Req() req: any, @Headers() header: any, @Body() commData: VerifyForgetPwdDto): Promise<AppResponse> {
		commData['ip'] = header['x-original-forwarded-for'];
		const pwdInfo: any = { ...commData };
		return this._authSvc.verifyForgetPwd(pwdInfo);
	}

	//#region Employer Registration
	@Post('employer-register')
	async employerRegister(@Req() req: any, @Headers() header: any, @Body() empRegDetails: EmployerRegisterDto) {
		/* header validation*/
		const requiredHeader = { key: 'content-type', value: 'application/x-www-form-urlencoded' };
		await this.validateHeader(header, requiredHeader);
		/* end header validation*/
		const regInfo: any = { ...empRegDetails };
		return this._authSvc.empRegister(regInfo, header['x-original-forwarded-for']);
	}

	@Patch('emp-set-password')
	@TempAuthorize()
	@ApiBearerAuth()
	async employerSetPassword(@Req() req: any, @Body() empPasword: EmployerPasswordDto) {
		return this._authSvc.empSetPassword(req.claims, empPasword);
	}

	@TempAuthorize()
	@Patch('emp-declaration')
	@ApiBearerAuth()
	async employerDeclarationVerify(@Req() req: any) {
		return this._authSvc.empDeclarationVerify(req.claims);
	}

	@ApiParam({ name: 'txnid', required: true })
	@Get('temp-token/:txnid')
	async generateTempToken(@Headers() header: any, @Param('txnid') txnid: string) {
		const ip = header['x-original-forwarded-for'];
		return this._authSvc.generateTempToken(ip, txnid);
	}

	//#endregion

	@Post('forget-password')
	async forgetPwd(@Headers() header: any, @Body() userCred: ForgetPwdDto): Promise<AppResponse> {
		const ip = header['x-original-forwarded-for'];
		userCred['ip'] = ip;
		return this._authSvc.forgetPwd(userCred);
	}

	/*Send OTP*/
	@Post('sendotp')
	async sendOtp(@Headers() header: any, @Body() sendOTPDto: SendOTPDto): Promise<AppResponse> {
		sendOTPDto['ip'] = header['x-original-forwarded-for'];
		const otpInfo: any = { ...sendOTPDto };
		return this._authSvc.sendOtp(otpInfo);
	}

	/*Send OTP*/
	@Post('verify-otp')
	async verifyOtp(@Headers() header: any, @Body() verifyOTPDto: VerifyOtpDto): Promise<AppResponse> {
		verifyOTPDto['ip'] = header['x-original-forwarded-for'];
		return this._authSvc.verifyOtp(verifyOTPDto);
	}

	@Post('exists')
	async accExists(@Body() body: ExistDto) {
		return this._authSvc.accExists(body);
	}

	async validateHeader(header: any, headerToValidate: any): Promise<AppResponse> {
		const headerMatch = header[headerToValidate.key].includes(headerToValidate['value']);
		if (headerMatch) {
			return createResponse(HttpStatus.OK, messages.S3);
		}
		const message = messageFactory(messages.E19, [headerToValidate['key'], header[headerToValidate['key']]]);
		throw new HttpException(message, HttpStatus.BAD_REQUEST);
	}

	@Authorize()
	// @HasRoles(RoleGroup.ADMIN_SUPERADMIN)
	@Post('resend-verification-link')
	async resendActLink(@Body() userInfo: ResendActLinkDto, @Req() req: any) {
		return this._authSvc.resendTempLink(userInfo, req.claims);
	}
}
