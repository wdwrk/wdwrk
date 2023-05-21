import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';
import { Kysely, PostgresDialect, type Generated, Migrator, FileMigrationProvider } from 'kysely';
import { Pool } from 'pg';
import { Env } from './env.js';
import { logger } from './logger.js';

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

export async function migrate(): Promise<void> {
	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: 'migrations',
		}),
	});

	const { results, error } = await migrator.migrateToLatest();

	if (results) {
		for (const result of results) {
			if (result.status === 'Success') {
				logger.info(`migrated ${result.migrationName} ${result.direction}`);
			} else if (result.status === 'Error') {
				logger.error(`failed to migrate ${result.migrationName} ${result.direction}`);
			} else if (result.status === 'NotExecuted') {
				logger.info(`skipped ${result.migrationName} ${result.direction}`);
			}
		}
	}

	if (error) {
		logger.error(error, 'failed to run migrations');
		process.exit(1);
	}
}
