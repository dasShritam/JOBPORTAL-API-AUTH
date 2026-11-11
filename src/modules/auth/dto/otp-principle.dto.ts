import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

class AuthStateDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Device id']) })
	readonly uniqueid: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Landing URL']) })
	readonly ondemandpage: string;
}

class VerifyOtpPrincipalDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Transaction id']) })
	readonly txn_id: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['One time password (OTP)']) })
	readonly otp: string;
	@ApiProperty()
	@Type(() => AuthStateDto)
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['State']) })
	readonly state: AuthStateDto;
}
/*Send OTP DTO*/

class SendOTPDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['To']) })
	readonly to: string;
	@ApiProperty()
	@IsOptional()
	@IsMongoId({ message: messageFactory(messages.W27, ['user id']) })
	readonly user_id: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Channel']) })
	@IsEnum(['sms', 'email'], { each: true, message: messageFactory(messages.W27, ['channel']) })
	readonly channel: string;
}
class VerifyOtpDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['To']) })
	readonly to: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Transaction id']) })
	readonly txn_id: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['One time password (OTP)']) })
	readonly otp: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Channel']) })
	@IsEnum(['sms', 'email'], { each: true, message: messageFactory(messages.W27, ['channel']) })
	readonly channel: string;
}

export { AuthStateDto, VerifyOtpPrincipalDto, SendOTPDto, VerifyOtpDto };
