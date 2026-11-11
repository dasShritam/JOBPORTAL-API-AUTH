import { EmployerPermission } from '@app/core/enums/employer-permission.enum';
import { Types } from 'mongoose';

export interface ProfileEmployerModel {
	/*Employer name*/
	user_id?: Types.ObjectId;
	co_id?: Types.ObjectId;
	name?: string;
	/*Profile image*/
	img?: {
		name: string /*File name with extension*/;
		updated_at: number;
	};
	role?: string;
	/*Reporting manage id*/
	rmid?: Types.ObjectId;
	/*Address*/
	adr?: {
		street: string;
		city: string;
		state: string;
		country: string;
		zip: number;
	};
	/*Permissions*/
	prm?: EmployerPermission[];
	created_by?: Types.ObjectId;
	created_at?: number;
	updated_at?: number;
}
