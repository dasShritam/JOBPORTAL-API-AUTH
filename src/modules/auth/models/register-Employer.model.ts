interface EmployerRegisterDto {
	readonly empName: string;
	readonly empMail: string;
	readonly empPhoneCode: string;
	readonly empPhoneNo: number;
	readonly empCompany: string;
	readonly empType: string;
	readonly empDesignation: string;
	readonly empPin: string;
	readonly empAddress: string;
	usersLimit: number;
	profileLimit: number;
	accessTill: number;
}

export { EmployerRegisterDto };
