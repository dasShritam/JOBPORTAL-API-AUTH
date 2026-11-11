enum EmployerPermission {
	MIJ = 'MIJ' /*Manage Internal Job Post*/,
	MEJ = 'MEJ' /*Manage External Job Post*/
}

class EmployerPermissionGroup {
	static readonly ALL_EMP_PERMISSION: EmployerPermission[] = [EmployerPermission.MIJ, EmployerPermission.MEJ];

	static readonly MIJ: EmployerPermission[] = [EmployerPermission.MIJ];

	static readonly MEJ: EmployerPermission[] = [EmployerPermission.MEJ];
}

enum WeekDaysEnum {
	SUNDAY = 'Sunday',
	MONDAY = 'Monday',
	TUESDAY = 'Tuesday',
	WEDNESDAY = 'Wednesday',
	THURSDAY = 'Thursday',
	FRIDAY = 'Friday',
	SATURDAY = 'Saturday'
}

class WeekDays {
	static readonly WEEKDAYS: WeekDaysEnum[] = [
		WeekDaysEnum.SUNDAY,
		WeekDaysEnum.MONDAY,
		WeekDaysEnum.TUESDAY,
		WeekDaysEnum.WEDNESDAY,
		WeekDaysEnum.THURSDAY,
		WeekDaysEnum.FRIDAY,
		WeekDaysEnum.SATURDAY
	];
}
export { EmployerPermission, EmployerPermissionGroup, WeekDays, WeekDaysEnum };
