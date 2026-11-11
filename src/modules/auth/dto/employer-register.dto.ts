import { messageFactory, messages } from '@app/shared/messages.shared';
import { CommonRegExp } from '@app/shared/regex.shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, Matches } from 'class-validator';

class EmployerRegisterDto {
	@ApiProperty()
	@Matches(CommonRegExp.NAME_REGEXP, { message: messageFactory(messages.W27, ['full name']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Full name']) })
	readonly empName: string;
	@ApiProperty()
	@Matches(CommonRegExp.EMAIL_REGEXP, { message: messageFactory(messages.W27, ['email address']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Email address']) })
	readonly empMail: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Country code']) })
	@Matches(CommonRegExp.PHONE_CODE_REGEX, { message: messageFactory(messages.W27, ['country code']) })
	readonly empPhoneCode: string;
	@ApiProperty()
	@Matches(CommonRegExp.PHONE_REGEXP, { message: messageFactory(messages.W27, ['phone number']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Phone number']) })
	readonly empPhoneNo: string;
	@ApiProperty()
	@Matches(CommonRegExp.COMPANY_NAME_REGEXP, { message: messageFactory(messages.W27, ['company name']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Company name']) })
	readonly empCompany: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Company domain type']) })
	readonly empType: string;
	@ApiProperty()
	@Matches(CommonRegExp.DESIGNATION_REGEXP, { message: messageFactory(messages.W27, ['designation']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Designation']) })
	readonly empDesignation: string;
	@ApiProperty()
	@Matches(CommonRegExp.POSTAL_INDEX_REGEXP, { message: messageFactory(messages.W27, ['postal index number (PIN)']) })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Postal index number (PIN)']) })
	readonly empPin: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Company address']) })
	readonly empAddress: string;
}

class EmployerDeclarationDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Declaration']) })
	@IsBoolean({ message: messageFactory(messages.W27, ['value for declaration']) })
	readonly empDeclaration: boolean;
}

class EmployerPasswordDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Password']) })
	readonly empPassword: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Temporary token']) })
	readonly token: string;
}

class EmployerSentOtpDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Phone number']) })
	@Matches(CommonRegExp.PHONE_REGEXP, { message: messageFactory(messages.W27, ['phone number']) })
	readonly empPhoneNo: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Country code']) })
	readonly empPhoneCode: string;
}

class EmployerResendDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Temporary token']) })
	readonly empUrl: string;
}

export { EmployerRegisterDto, EmployerDeclarationDto, EmployerPasswordDto, EmployerSentOtpDto, EmployerResendDto };
