import { messageFactory, messages } from '@app/shared/messages.shared';
import { CommonRegExp } from '@app/shared/regex.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, plainToClass } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf, ValidateNested } from 'class-validator';

//#region If email id not found from social media verify email id and register
class AuthStateDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Device id']) })
	readonly uniqueid: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Landing URL']) })
	readonly ondemandpage: string;
}

class VerifyIdentityDto {
	@ApiProperty()
	@Matches(CommonRegExp.EMAIL_REGEXP, { message: messageFactory(messages.W27, ['email address']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['email address']) })
	readonly email: string;
	@ApiProperty()
	@IsInt({ message: messageFactory(messages.W27, ['one time password (OTP)']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['One time password (OTP)']) })
	readonly otp: number;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Temporary token']) })
	readonly token: string;
	@ApiProperty()
	@Type(() => AuthStateDto)
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['State']) })
	readonly state: AuthStateDto;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W2, ['Transaction id']) })
	readonly txn_id: string;
}
//#endregion

class JobseekerProfileDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Full name']) })
	fullName: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Email address']) })
	@Matches(CommonRegExp.EMAIL_REGEXP, { message: messageFactory(messages.W27, ['email address']) })
	email: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Phone number']) })
	@Matches(CommonRegExp.PHONE_REGEXP, { message: messageFactory(messages.W27, ['phone number']) })
	phno: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Password']) })
	pwd: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Fresher']) })
	fresher: boolean;
	@ApiProperty()
	@ValidateIf((dto: any) => dto.fresher === 'true')
	@IsNotEmpty({ message: messageFactory(messages.W28, ['City']) })
	currentcity: string;
	@ApiProperty()
	@ValidateIf((dto: any) => dto.fresher === 'true')
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Country']) })
	currentcountry: string;
	@ApiProperty()
	@Matches(CommonRegExp.PHONE_CODE_REGEX, { message: messageFactory(messages.W27, ['Country code']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Country code']) })
	country_code: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Date of birth (DOB)']) })
	dateofbirth: string;
}

class JobSeekerSelfRegDto {
	@IsOptional()
	readonly resume: any;
	@IsOptional()
	readonly video: any;
	@ApiProperty()
	@Type(() => JobseekerProfileDto)
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Profile information']) })
	@Transform(({ value }) => {
		if (typeof value === 'string') value = JSON.parse(value);
		return plainToClass(JobseekerProfileDto, value);
	})
	readonly jsProfile: JobseekerProfileDto;
}

class ExistDto {
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Key']) })
	@IsString()
	key: string;
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Value']) })
	value: string | number;
}

export { VerifyIdentityDto, JobSeekerSelfRegDto, ExistDto };
