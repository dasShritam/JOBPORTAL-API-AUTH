export function messageFactory(message: string, msgParams?: string[]): string {
	if (msgParams) {
		msgParams.forEach((val, key) => {
			message = message.split(`ARG${key}`).join(val?.toString());
		});
	}
	return message;
}

export const enum messages {
	//ARG0,ARG1 ... ARGn should be in sequence.
	//Genaral messages : Start with Gn
	G1 = 'Captive Jobs',
	G2 = 'AUTHENTICATION API DOCUMENTATION',
	G3 = 'Authentication API',
	//Success messages : Start with Sn
	S1 = 'auth service is up and running',
	S2 = 'Connected to mongo db!',
	S3 = 'Success',
	S4 = `You've been logged out. Thank you for using our web application. We hope you had a great experience. Feel free to log in again whenever you need!.`,
	S5 = 'Your OTP (One Time Password) has been sent successfully! Please check your registered email/phone number for the OTP.',
	S6 = 'Congratulations! Your OTP (One Time Password) has been verified successfully.',
	S7 = 'Congratulations! Your password has been successfully updated. You can now log in to our web application using your new password.',
	S8 = 'Welcome back! You have successfully logged in to our web application.',
	S9 = 'Congratulations! Just one step left. Click the link in the verification email to complete your registration.',
	S11 = `Congratulations on creating your account! We're excited to have you on board. Begin your journey with us now!`,
	S13 = 'auth service is listening on ARG0.',
	S14 = 'Great news! The activation link has been sent successfully.',

	//Warning messages : Start with Wn
	W1 = `Unable to send an OTP (One Time Password). Please ensure that the mobile number or email address provided is correct and active.`,
	W2 = 'We regret to inform you that your account has been disabled. To resolve this issue or to seek further information, please contact our support team.',
	W3 = `Login failed - Username or password you entered did not match our records. Please double-check your login credentials to ensure they are entered correctly.`,
	W4 = 'Login failed - We could not find an account associated with the provided information. Please double-check the username or email address you entered to ensure they are entered correctly.',
	W6 = `It seems that your session has expired. To continue accessing our web application, please sign in again.`,
	W7 = `Unable to verify OTP (One Time Password). Please double-check the OTP (One Time Password) and try verifying again.`,
	W8 = 'The password you entered is incorrect. Please double-check your password and try again!',
	W9 = `Sorry, but your new password cannot be the same as your previous password. Please choose a different password.`,
	W10 = `We could not find an account associated with the provided information. Please check the information you have provided and try again!`,
	W11 = 'Please provide a valid ARG0!',
	W12 = `Sorry, we couldn't verify the phone number you provided. Please ensure it is correct and try again.`,
	W13 = 'The email address you entered is already associated with an existing account. Please try signing in or use a different email address to register.',
	W14 = 'Verification link expired.',
	W15 = 'Invalid verification link. Please ensure you have copied the link correctly!',
	W16 = 'No email address is associated with selected ARG0 account, Please provide a valid email address and verify to complete account setup!',
	W17 = 'Congratulations, your account has been successfully created but an error occurred while giving an access to the application. Please login!',
	W18 = 'It seems that your session has expired. Please try registering again!',
	W19 = 'Wrong or expired OTP (One Time Password). Please try again!',
	W22 = 'Unable to send the OTP (One Time Password). Please double-check the phone number or email address and try again.',
	W25 = 'Uploaded file format is not allowed. Only .mp4, .m4v, and .mkv format is allowed!',
	W26 = 'Uploaded file format is not allowed. Only .pdf and .docx format is allowed!',
	W27 = 'Please provide a valid ARG0!',
	W28 = 'ARG0 should not be empty!',
	W29 = 'Password should be 8 to 16 characters with at least one special characters (!@#$%^&*?), one numeric, one small case and one upper case letter (i.e. Abcd@123).',
	W31 = 'You do not have permission to access this application with requested role. Please contact the system administrator or customer support for further assistance!',
	W32 = 'Username or password you entered did not match our records. Please double-check your login credentials to ensure they are entered correctly.',
	W33 = 'Unable to find organization profile or account has been disabled. Please contact the system administrator or customer support for further assistance!',
	W34 = 'We regret to inform you that we are currently unable to send the activation link for the selected role. Please ensure you have chosen a valid role and try again.',
	W35 = `We're sorry, but the account you have chosen is already activated. Hence, we cannot resend the activation link.`,
	W37 = 'We regret to inform you that your account is restricted for use on ARG0. Please reach out to the administrator for further information and assistance.',
	W38 = 'We regret to inform you that your account has time-based restrictions. It can only be accessed between ARG0 and ARG1. Please contact your administrator for further information and assistance.',
	W39 = `We could not find an account associated with your information. Please reach out to our support team for further assistance.`,
	W40 = 'please provide a valid password. Note: To ensure your accounts safety, password must be encoded.',
	W41 = 'The ARG0 file size should not exceed ARG1. Please ensure that the provided file is within this size limit.',
	//Error messages : Start with En
	E1 = 'Techri auth service start failed! :: ARG0.',
	E2 = 'Oops! An error occurred while processing your request.',
	E3 = 'Unauthorized request!',
	E4 = 'An error occurred while establishing connection to mongo db : ARG0.',
	E5 = 'Mongo database connection disconnected!',
	E6 = 'Mongo database connection disconnected through app termination!',
	E7 = 'There was a problem while authenticating you, please try again!',
	E9 = 'We regret to inform you that an error occurred while authenticating your credentials. Please retry the authentication process!',
	E10 = `We're sorry, but we are unable to process your request at this time. Please reach out to our support team for further assistance.`,
	E12 = 'Oops! There was a problem with your registration. Please try again and ensure that you have entered the correct information.',
	E14 = 'Oops! There was a problem while sending the email. Please try again and ensure that the email address is correct.',
	E15 = 'Oops! There was a problem with the upload process, and it failed. Please try again and ensure that you have selected the correct file.',
	E16 = 'Sorry, but the password you provided has been previously used. For security reasons, please select a unique password that you have not used in the past.',
	E17 = 'Please provide a valid email.',
	E18 = 'An OTP (One Time Password) has been sent to ARG0. Please note that you may not receive the OTP (One Time Password) if the number is not registered with us.',
	E19 = 'ARG0 "ARG1" not supported.',
	E20 = 'The employer with the id : ARG0 does not exist.',
	E21 = 'We are sorry, but you do not have access to this resource [ARG0]!',
	E22 = 'Sorry, but it seems that you do not have the necessary permissions to use the requested feature. Please contact the system administrator or our support team for further guidance.',
	// Email message : Start with Mn
	M1 = 'RESET PASSWORD',
	M2 = 'REGISTERED JOBSEEKER SUCCESSFULLY',
	M3 = 'VERIFY EMPLOYER',
	M4 = 'SUCCESSFUL REGISTRATION EMPLOYER',
	M5 = 'REGISTRATION',
	M6 = 'EMAIL VERIFICATION',
	// EmailText message : Start with Tn
	T1 = 'Email Verification OTP - Verify Your Email Address.',
	T2 = 'Reset password',
	T3 = 'Successful Registration Confirmation',
	T4 = 'Complete Your Registration - Activate Your Account Today.',
	T5 = 'OTP for Captive Jobs is ARG0 and valid till ARG1 minutes. Do not share this OTP to anyone for security reasons.',
	T6 = 'alctec'
}
