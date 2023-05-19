import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('log')

		.addColumn('id', 'serial', (column) => column.primaryKey())
		.addColumn('level', 'text', (column) => column.notNull())
		.addColumn('message', 'text')
		.addColumn('rest', 'jsonb')
		.addColumn('timestamp', 'timestamptz', (column) => column.notNull())

		.execute();

	await db.schema.createIndex('log_timestamp_index').using('btree').on('log').column('timestamp').execute();

	await db.schema.createIndex('log_level_index').using('hash').on('log').column('level').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('log').execute();
}
