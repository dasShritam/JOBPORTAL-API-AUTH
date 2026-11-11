export interface UserAccountModel {
	_id?: string;
	uname?: string;
	name?: string;
	/*Contact information*/
	ci?: {
		/*Primary or secondary contact information*/
		prim: {
			ph?: {
				code?: string;
				val?: string;
				/*Is verified*/
				iv?: boolean;
			};
			mail?: {
				val?: string;
				/*Is verified*/
				iv?: boolean;
			};
		};
	};
	/*Social network*/
	soc_net?: {
		id?: string;
		name?: string;
		created_at?: number;
	};
	pwd?: [
		/*Password*/
		{
			hash: string;
			created_at: number;
			active: boolean;
		}
	];
	role?: string /*Jobseeker,Employer or Admin*/;
	reg_mode?: string /*Credentials or Google or Twitter or Linked In or Facebook*/;
	login_enabled?: boolean;
	active?: boolean;
	created_by?: string;
	created_at?: number;
	updated_at?: number;
}
