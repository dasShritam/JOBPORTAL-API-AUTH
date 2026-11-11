import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

class ResetPasswordDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, [`Current password`]) })
	readonly oldPassword: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, [`New password`]) })
	readonly newPassword: string;
}
class ForgetPwdDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Auth Type']) })
	@IsEnum(['sms', 'email'], { each: true, message: messageFactory(messages.W27, ['auth type']) })
	readonly authType: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['To']) })
	readonly to: string;
}
class VerifyForgetPwdDto {
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
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Auth Type']) })
	@IsEnum(['sms', 'email'], { each: true, message: messageFactory(messages.W27, ['auth type']) })
	readonly authType: string;
}

export { ResetPasswordDto, ForgetPwdDto, VerifyForgetPwdDto };
