import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface SendEmailDto {
	readonly filePath: string;
	replacements: any;
	readonly mailOptions: ISendMailOptions;
}
