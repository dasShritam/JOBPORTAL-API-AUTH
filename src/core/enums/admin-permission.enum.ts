enum AdminPermission {
	JSM = 'JSM' /*Jobseeker management*/,
	ERM = 'ERM' /*Employer management*/,
	DA = 'DA' /*Dashboard Access*/,
	FAQM = 'FAQM' /*Frequently asked question*/,
	CSM = 'CSM' /*Customer support management*/
}

class AdminPermissionGroup {
	static readonly ALL_EMP_PERMISSION: AdminPermission[] = [
		AdminPermission.JSM,
		AdminPermission.ERM,
		AdminPermission.DA,
		AdminPermission.FAQM,
		AdminPermission.CSM
	];
}

export { AdminPermission, AdminPermissionGroup };
