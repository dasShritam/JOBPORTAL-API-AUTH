import { AbstractAuthDao } from '@app/database/mongo/abstract/auth.abstract';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
	constructor(public authTxn: AbstractAuthDao) {}
}
