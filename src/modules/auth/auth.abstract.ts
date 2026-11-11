import { AppResponse } from '@app/shared/appresponse.shared';
import { VerifyIdentityDto } from './models/job-seeker.register.dto';
import { AtPayload } from './models/jwt-payload.model';
import {
	forgetPwdVerificationPrincipal,
	otpSignIn,
	SendOtpDto,
	verifyAndCreateTokenPrincipal,
	verifyOtpPrincipal
} from './models/otp-principal.model';
import { EmployerRegisterDto } from './models/register-Employer.model';
import { ResetPasswordDto } from './models/reset-password.model';
import { AccessTokenPrincipal, RefreshTokenPrincipal } from './models/token-principal.model';
import { SocialMediaAccessTokenPrincipalDto } from './dto';
import { ExistDto, ResendActLinkDto } from './dto/auth.dto';

export abstract class AbstractAuthSvc {
	abstract socialMediaSignIn(signInCred: SocialMediaAccessTokenPrincipalDto): Promise<AppResponse>;
	abstract adminSignIn(adminCred: AccessTokenPrincipal): Promise<AppResponse>;
	abstract employerSignIn(userCred: AccessTokenPrincipal): Promise<AppResponse>;
	abstract jobseekerSignIn(userCred: AccessTokenPrincipal): Promise<AppResponse>;
	abstract refreshToken(userCred: RefreshTokenPrincipal): Promise<AppResponse>;
	abstract validateToken(token: any): Promise<AppResponse>;
	abstract validateTempToken(token: any): Promise<AppResponse>;
	abstract logout(sessionId: AtPayload): Promise<AppResponse>;
	abstract otpSignIn(signInCred: otpSignIn): Promise<AppResponse>;
	abstract verifyAndCreateToken(commData: verifyAndCreateTokenPrincipal): Promise<AppResponse>;
	abstract resetPassword(userClaims: AtPayload, resetPwdDetails: ResetPasswordDto): Promise<AppResponse>;
	abstract verifyForgetPwd(commData: forgetPwdVerificationPrincipal): Promise<AppResponse>;
	abstract register(userCred: AccessTokenPrincipal): Promise<AppResponse>;
	abstract verifyIdentityAndRegister(regDto: VerifyIdentityDto): Promise<AppResponse>;
	abstract checkMail(empMail: string): Promise<AppResponse>;
	abstract empRegister(empRegDetails: EmployerRegisterDto, ip: string): Promise<AppResponse>;
	abstract generateTempToken(ip: string, empUrl: string): Promise<AppResponse>;
	abstract empSetPassword(userClaims: any, empPassword: any): Promise<AppResponse>;
	abstract empDeclarationVerify(id: AtPayload): Promise<AppResponse>;
	abstract forgetPwd(userCred: any): Promise<AppResponse>;
	abstract jobSeekerSelfRegister(jsDetails: any): Promise<AppResponse>;
	abstract sendOtp(sendOtpDto: SendOtpDto): Promise<AppResponse>;
	abstract verifyOtp(verifyOtpDto: verifyOtpPrincipal): Promise<AppResponse>;
	abstract accExists(details: ExistDto): Promise<AppResponse>;
	abstract resendTempLink(userInfo: ResendActLinkDto, claims: AtPayload): Promise<AppResponse>;
}
