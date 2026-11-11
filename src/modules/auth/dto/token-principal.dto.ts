import { RoleGroup } from '@app/core/enums/role-type.enum';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToClass } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

class AuthStateDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Device id']) })
	readonly uniqueid: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Landing URL']) })
	readonly ondemandpage: string;
	@ApiProperty()
	@IsOptional()
	readonly redirect_uri: string;
	@ApiProperty()
	@IsOptional()
	readonly code_verifier?: string;
}

class AccessTokenPrincipalDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(['credentials'], { each: true, message: messageFactory(messages.W27, ['auth type']) })
	readonly authType: string = 'credentials';
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Authentication key']) })
	readonly authKey: string;
	@ApiPropertyOptional()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Password']) })
	readonly pwd: string;
	@ApiProperty()
	@Type(() => AuthStateDto)
	@Transform(({ value }) => {
		if (typeof value === 'string') value = JSON.parse(value);
		return plainToClass(AuthStateDto, value);
	})
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['State']) })
	readonly state: AuthStateDto;
}

class SocialMediaAccessTokenPrincipalDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsEnum(['google', 'linkedin', 'facebook', 'twitter'], { each: true, message: messageFactory(messages.W27, ['auth type']) })
	readonly authType: string = 'google';
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Authentication key']) })
	readonly authKey: string;
	@ApiProperty()
	@Type(() => AuthStateDto)
	@Transform(({ value }) => {
		if (typeof value === 'string') value = JSON.parse(value);
		return plainToClass(AuthStateDto, value);
	})
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['State']) })
	readonly state: AuthStateDto;
}

class RefreshTokenPrincipalDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Refresh token']) })
	readonly refreshToken?: string;
	@ApiProperty()
	@Type(() => AuthStateDto)
	@ValidateNested({ each: true })
	@IsNotEmpty({ message: messageFactory(messages.W28, ['State']) })
	readonly state: AuthStateDto;
}
class OtpSignInDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Country code']) })
	readonly code: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Phone number']) })
	readonly phNo: string;
	@ApiProperty()
	@IsOptional()
	@IsEnum([...RoleGroup.JOBSEEKER], { each: true, message: messageFactory(messages.W27, ['role']) })
	readonly role: string;
}

export { AccessTokenPrincipalDto, RefreshTokenPrincipalDto, OtpSignInDto, SocialMediaAccessTokenPrincipalDto };
