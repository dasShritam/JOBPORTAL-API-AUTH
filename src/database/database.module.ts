import { DatabaseService } from '@app/database/database.service';
import { AbstractAuthDao } from '@app/database/mongo/abstract/auth.abstract';
import { mongoDbProvider } from '@app/database/mongo/connection/connection.mongo';
import { mongoDbModelsProvider } from '@app/database/mongo/connection/models.connection.mongo';
import { AuthDao } from '@app/database/mongo/dao/auth.dao';
import { Module } from '@nestjs/common';

@Module({
	providers: [
		...mongoDbProvider,
		...mongoDbModelsProvider,
		DatabaseService,
		{
			provide: AbstractAuthDao,
			useClass: AuthDao
		}
	],
	exports: [DatabaseService]
})
export class DatabaseModule {}
