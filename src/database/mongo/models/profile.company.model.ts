export interface ProfileCompanyModel {
	/*Organization profile information*/
	profile?: {
		name?: string;
		ind?: string /*Type of Industry*/;
		alias?: string;
		/*Point of contact information*/
		poc?: {
			name?: string;
			role?: string /* Designation or role of contact person*/;
			ph?: {
				prim?: string /*Primary contact phone number*/;
				secd?: string /*Secondary contact phone number*/;
			};
		};
		web?: string /*Website URL*/;
		logo?: {
			name?: string /*File name with extension*/;
			updated_at?: number;
		};
		hvpf?: string /*Profile for Hot Vacancies*/;
		clpf?: string /*Profile for Classifieds*/;
		fax?: string;
		tan?: string;
		adr?: {
			street?: string;
			city?: string;
			state?: string;
			country?: string;
			zip?: number;
		};
	};
	tc?: boolean /*Terms and conditions are accepeted*/;
	created_at?: number;
	updated_at?: number;
	active?: boolean;
}
