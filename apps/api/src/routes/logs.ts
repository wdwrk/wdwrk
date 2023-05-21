import { notFound } from '@hapi/boom';
import type { ZodRecord, ZodString } from 'zod';
import { z } from 'zod';
import { db } from '../database.js';
import { jsonParser } from '../middleware/jsonParser.js';
import { validate } from '../middleware/validate.js';
import type { Route } from '../route.js';

const primitiveSchema = z.union([z.string(), z.number(), z.boolean()]);
const timestampSchema = z.string().datetime().pipe(z.coerce.date());

export const getLog: Route = {
	method: 'get',
	path: '/logs/:id',
	middleware: [],
	async handler(req, res, next) {
		const { id } = req.params as { id: string };

		const log = await db.selectFrom('log').selectAll().where('id', '=', Number.parseInt(id, 10)).executeTakeFirst();

		if (!log) {
			return next(notFound('no log with that ID was found'));
		}

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(log));
	},
};

const putSchema = z
	.object({
		logs: z
			.array(
				z
					.object({
						level: z.string(),
						message: z.string().nullable(),
						timestamp: timestampSchema,
					})
					.catchall(primitiveSchema),
			)
			.min(1)
			.max(100),
	})
	.strict();
type PutBody = z.infer<typeof putSchema>;

export const putLogs: Route = {
	method: 'put',
	path: '/logs',
	middleware: [jsonParser(), validate('body', putSchema)],
	async handler(req, res) {
		const body = req.body as PutBody;

		const logs = await db
			.insertInto('log')
			.values(
				body.logs.map(({ level, message, timestamp, ...rest }) => ({
					level,
					message,
					timestamp,
					rest,
				})),
			)
			.returning(['id', 'level', 'message', 'timestamp'])
			.execute();

		res.statusCode = 201;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(logs));
	},
};

const baseParamQueryParamSchema = z.union([
	z
		.object({
			equals: primitiveSchema.nullish(),
		})
		.strict(),
	z
		.object({
			equalsNot: primitiveSchema.nullish(),
		})
		.strict(),
	z
		.object({
			includes: z.string().optional(),
			includesNot: z.string().optional(),
		})
		.strict()
		.refine((data) => data.includes != null || data.includesNot != null),
	z
		.object({
			gt: z.number().optional(),
			lt: z.number().optional(),
		})
		.strict()
		.refine((data) => data.gt != null || data.lt != null),
]);

type QueryParam = z.infer<typeof baseParamQueryParamSchema> & {
	[key: string]: QueryParam;
};

const paramQuerySchema = z.record(
	z.string(),
	z.union([baseParamQueryParamSchema, z.lazy(() => paramQuerySchema)]),
) as ZodRecord<ZodString, z.ZodType<QueryParam[string]>>;

const querySchema = z
	.object({
		start: timestampSchema,
		end: timestampSchema.default(() => new Date().toISOString()),
		limit: z.number().int().min(1).max(100).default(100),
	})
	.catchall(paramQuerySchema.valueSchema);

type QueryBody = z.infer<typeof paramQuerySchema> & z.infer<typeof querySchema>;

function checkQuery(schema: QueryParam[string], data: unknown): boolean {
	const { equals, equalsNot, includes, includesNot, gt, lt, ...rest } = schema;

	// Those are immediate exits, since the fields are mutually exlusive
	if (equals !== undefined) {
		return data === schema.equals;
	}

	if (equalsNot !== undefined) {
		return data !== schema.equalsNot;
	}

	if (includes !== undefined) {
		if (typeof data !== 'string') {
			return false;
		}

		if (!data.includes(schema.includes as string)) {
			return false;
		}
	}

	if (includesNot !== undefined) {
		if (typeof data !== 'string') {
			return false;
		}

		if (data.includes(schema.includesNot as string)) {
			return false;
		}
	}

	if (gt !== undefined) {
		if (typeof data !== 'number') {
			return false;
		}

		if (data < (schema.gt as number)) {
			return false;
		}
	}

	if (lt !== undefined) {
		if (typeof data !== 'number') {
			return false;
		}

		if (data > (schema.lt as number)) {
			return false;
		}
	}

	for (const [key, value] of Object.entries(rest)) {
		if (typeof data !== 'object' || data == null) {
			return false;
		}

		if (!checkQuery(value, (data as any)[key])) {
			return false;
		}
	}

	return true;
}

export const queryLogs: Route = {
	method: 'post',
	path: '/logs/query',
	middleware: [jsonParser(), validate('body', querySchema)],
	async handler(req, res) {
		const { start, end, limit, ...params } = req.body as QueryBody;

		const query = db
			.selectFrom('log')
			.selectAll()
			.where('timestamp', '>=', start)
			.where('timestamp', '<=', end)
			.orderBy('timestamp', 'asc');

		const hasParams = Object.keys(params).length > 0;

		const selected = await (hasParams ? query : query.limit(limit)).execute();
		const final = hasParams ? [] : selected;

		if (hasParams) {
			for (const log of selected) {
				for (const [key, value] of Object.entries(params)) {
					if (checkQuery(value, log.rest[key]) && final.push(log) >= limit) {
						break;
					}
				}
			}
		}

		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(final));
	},
};
