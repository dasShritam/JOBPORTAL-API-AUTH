import { MongoConstants } from '@app/database/mongo/connection/constants.mongo';
import { Connection } from 'mongoose';
import {
	createLogAppSessionSchema,
	createLogAssessmentReportSchema,
	createLogAssessmentScheduleSchema,
	createLogEmailSchema,
	createLogPaymentSchema,
	createLogSubscriptionSchema,
	createMasterAssessmentSchema,
	createMasterCertNameSchema,
	createMasterCertProviderSchema,
	createMasterCompanySchema,
	createMasterCountrySchema,
	createMasterDepartmentSchema,
	createMasterDesignationSchema,
	createMasterGenericSchema,
	createMasterIndustrySchema,
	createMasterInstituteSchema,
	createMasterJobRoleCategorySchema,
	createMasterJobRoleSchema,
	createMasterLocationSchema,
	createMasterSkillSchema,
	createMasterSpecializationSchema,
	createNotificationConversationActionSchema,
	createNotificationConversationSchema,
	createNotificationPollResponseSchema,
	createNotificationPollSchema,
	createProfileCompanySchema,
	createProfileEmployerSchema,
	createProfileJobSeekerPrivateSchema,
	createProfileJobSeekerSchema,
	createRecruitFollowerSchema,
	createRecruitJobPostApplicationSchema,
	createRecruitJobPostInternalApplicationSchema,
	createRecruitJobPostInternalSchema,
	createRecruitJobPostQuestionSchema,
	createRecruitJobPostSchema,
	createRecruitQuestionTemplateSchema,
	createSecurityOtpTraceSchema,
	createSecurityTemporaryTokenSchema,
	createSecurityUserAccountSchema,
	createSupportFaqSchema,
	createSupportTicketActivitySchema,
	createSupportTicketSchema
} from '../schemas';
import { createRecruitTraceProfileViewSchema } from '../schemas/recruit.trace-profile-view.schema';

const mongoDbModelsProvider = [
	{
		provide: MongoConstants.APP_SESSION_SCHEMA,
		useFactory: (connection: Connection) => createLogAppSessionSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOG_ASSESSMENT_REPORT_SCHEMA,
		useFactory: (connection: Connection) => createLogAssessmentReportSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOG_ASSESSMENT_SCHEDULE_SCHEMA,
		useFactory: (connection: Connection) => createLogAssessmentScheduleSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOG_MAIL_SCHEMA,
		useFactory: (connection: Connection) => createLogEmailSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOG_PAYMENT_SCHEMA,
		useFactory: (connection: Connection) => createLogPaymentSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOG_SUBSCRIPTION_SCHEMA,
		useFactory: (connection: Connection) => createLogSubscriptionSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.MASTER_ASSESSMENT,
		useFactory: (connection: Connection) => createMasterAssessmentSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.CERT_NAME_SCHEMA,
		useFactory: (connection: Connection) => createMasterCertNameSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.CERT_PROVIDER_SCHEMA,
		useFactory: (connection: Connection) => createMasterCertProviderSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.COMPANY_SCHEMA,
		useFactory: (connection: Connection) => createMasterCompanySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.COUNTRY_SCHEMA,
		useFactory: (connection: Connection) => createMasterCountrySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.DEPARTMENT_SCHEMA,
		useFactory: (connection: Connection) => createMasterDepartmentSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.DESIGNATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterDesignationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.GENERIC_SCHEMA,
		useFactory: (connection: Connection) => createMasterGenericSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.INDUSTRY_SCHEMA,
		useFactory: (connection: Connection) => createMasterIndustrySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.INSTITUTE_SCHEMA,
		useFactory: (connection: Connection) => createMasterInstituteSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_ROLE_CATEGORY_SCHEMA,
		useFactory: (connection: Connection) => createMasterJobRoleCategorySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_ROLE_SCHEMA,
		useFactory: (connection: Connection) => createMasterJobRoleSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.LOCATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterLocationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SKILL_SCHEMA,
		useFactory: (connection: Connection) => createMasterSkillSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.NOTIFICATION_CONVERSATION_ACTION_SCHEMA,
		useFactory: (connection: Connection) => createNotificationConversationActionSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.NOTIFICATION_CONVERSATION_SCHEMA,
		useFactory: (connection: Connection) => createNotificationConversationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SPECIALIZATION_SCHEMA,
		useFactory: (connection: Connection) => createMasterSpecializationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.NOTIFICATION_POLL_RESPONSE_SCHEMA,
		useFactory: (connection: Connection) => createNotificationPollResponseSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.NOTIFICATION_POLL_SCHEMA,
		useFactory: (connection: Connection) => createNotificationPollSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.PROFILE_COMPANY_SCHEMA,
		useFactory: (connection: Connection) => createProfileCompanySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.PROFILE_EMPLOYER_SCHEMA,
		useFactory: (connection: Connection) => createProfileEmployerSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOBSEEKER_PROFILE_PRIVATE_SCHEMA,
		useFactory: (connection: Connection) => createProfileJobSeekerPrivateSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOBSEEKER_PROFILE_SCHEMA,
		useFactory: (connection: Connection) => createProfileJobSeekerSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.RECRUIT_FOLLOWER_SCHEMA,
		useFactory: (connection: Connection) => createRecruitFollowerSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_POST_QUESTION_SCHEMA,
		useFactory: (connection: Connection) => createRecruitJobPostQuestionSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_POST_RESPONSE_SCHEMA,
		useFactory: (connection: Connection) => createRecruitJobPostApplicationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.RECRUIT_JOBPOST_INTERNAL_APPLICATION_SCHEMA,
		useFactory: (connection: Connection) => createRecruitJobPostInternalApplicationSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.RECRUIT_JOBPOST_INTERNAL_SCHEMA,
		useFactory: (connection: Connection) => createRecruitJobPostInternalSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.JOB_POST_SCHEMA,
		useFactory: (connection: Connection) => createRecruitJobPostSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.QUESTION_TEMPLATE_SCHEMA,
		useFactory: (connection: Connection) => createRecruitQuestionTemplateSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.OTP_TRACE_SCHEMA,
		useFactory: (connection: Connection) => createSecurityOtpTraceSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.TEMPORARY_TOKEN_SCHEMA,
		useFactory: (connection: Connection) => createSecurityTemporaryTokenSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.USER_ACCOUNT_SCHEMA,
		useFactory: (connection: Connection) => createSecurityUserAccountSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SUPPORT_FAQ_SCHEMA,
		useFactory: (connection: Connection) => createSupportFaqSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SUPPORT_TICKET_SCHEMA,
		useFactory: (connection: Connection) => createSupportTicketSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.SUPPORT_TICKET_ACTIVITY_SCHEMA,
		useFactory: (connection: Connection) => createSupportTicketActivitySchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	},
	{
		provide: MongoConstants.RECRUIT_TRACE_PROFILE_VIEW_SCHEMA,
		useFactory: (connection: Connection) => createRecruitTraceProfileViewSchema(connection),
		inject: [MongoConstants.MONGO_DB_PROVIDER]
	}
];

export { mongoDbModelsProvider };
