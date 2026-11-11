import { ExistType } from '@app/core/enums/exist-type.enum';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';

class ResendActLinkDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['User id']) })
	@IsMongoId({ message: messageFactory(messages.W11, ['user id']) })
	readonly userId: Types.ObjectId;
}
class ExistDto {
	@ApiProperty()
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMinSize(1, { message: messageFactory(messages.W11, ['data']) })
	@Type(() => ExistTypeDto)
	data: ExistTypeDto[];
}
class ExistTypeDto {
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Key']) })
	@IsEnum(ExistType, { each: true, message: messageFactory(messages.W27, ['key']) })
	key: string;
	@ApiProperty()
	@IsNotEmpty({ message: messageFactory(messages.W28, ['Value']) })
	value: string;
	@ApiProperty()
	@IsOptional()
	code: string;
}
export { ResendActLinkDto, ExistDto };
