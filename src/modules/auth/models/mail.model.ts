export interface MailModel {
	from: string;
	to: string;
	cc?: string;
	bcc?: string;
	sub: string;
	body: string;
	atch?: string[];
	sts: string;
	retry: number;
}
