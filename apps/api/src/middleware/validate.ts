import { badData } from '@hapi/boom';
import type { NextHandler, Request, Response } from 'polka';
import type { Schema } from 'zod';

export type ValidateMiddlewareProp = 'body' | 'body' | 'headers' | 'params' | 'query';

export function validate(prop: ValidateMiddlewareProp, schema: Schema<any>) {
	return async (req: Request, _: Response, next: NextHandler) => {
		const result = schema.safeParse(req[prop]);

		if (!result.success) {
			return next(badData(result.error?.message, result.error));
		}

		req[prop] = result.data as unknown;
		return next();
	};
}
