import { messages } from '@app/shared/messages.shared';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
export const setupSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder().setTitle(`${messages.G1} ${messages.G2}`).setVersion('1.0').addBearerAuth().build(),
		swaggerDoc = SwaggerModule.createDocument(app, config),
		customOptions: SwaggerCustomOptions = {
			customSiteTitle: `${messages.G1} ${messages.G3}`,
			customCss: `.swagger-ui .topbar { background-color: #ffffff; border-bottom: 5px solid #3f51b5; }`
		};
	writeFileSync('./auth-swagger-spec.json', JSON.stringify(swaggerDoc));

	SwaggerModule.setup('api/docs/swagger', app, swaggerDoc, customOptions);
};
