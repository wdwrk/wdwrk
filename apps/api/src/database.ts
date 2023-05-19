import { Kysely, PostgresDialect, type Generated } from 'kysely';
import { Pool } from 'pg';
import { Env } from './env.js';

export interface LogTable {
	id: Generated<number>;
	level: string;
	message: string | null;
	rest: Record<string, unknown>;
	timestamp: Date;
}

interface Database {
	log: LogTable;
}

const env = Env.get();

export const db = new Kysely<Database>({
	dialect: new PostgresDialect({
		pool: new Pool({
			host: env.postgresHost,
			port: env.postgresPort,
			user: env.postgresUser,
			password: env.postgresPassword,
			database: env.postgresDatabase,
		}),
	}),
});
