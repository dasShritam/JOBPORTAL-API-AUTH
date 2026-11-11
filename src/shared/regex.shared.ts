class CommonRegExp {
	public static readonly NAME_REGEXP = /^[A-Za-z]+[A-Za-z\s]{3,202}$/g;
	public static readonly EMAIL_REGEXP = /^(?=[^+\-*\/]*$)([A-Za-z0-9_.-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}([.][a-zA-Z]{2,})?)$/g;
	public static readonly PHONE_REGEXP = /^[1-9][0-9]{5,11}$/g;
	public static readonly COMPANY_NAME_REGEXP = /^[a-zA-Z0-9][a-zA-Z0-9&'.,()&@_\s-]{0,99}$/g;
	public static readonly DESIGNATION_REGEXP = /^[a-zA-Z0-9][a-zA-Z0-9\s.-]{0,99}$/g;
	public static readonly POSTAL_INDEX_REGEXP = /^[1-9][0-9]{3,5}$/; /*PIN Code*/
	public static readonly PASSWORD_REGEX = /(?=^.{8,16}$)(?=.*\d)(?=.*[!@#$%^&*?]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
	public static readonly PHONE_CCODE_REGEXP = /^\+\d{1,5}(?:\s\d{1,5})? [1-9][0-9]{5,11}$/g;
	public static readonly PHONE_CODE_REGEX = /^\+\d{1,4}$/;
}

export { CommonRegExp };
