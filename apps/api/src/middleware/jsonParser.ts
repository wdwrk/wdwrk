import { badData, badRequest } from '@hapi/boom';
import type { NextHandler, Request, Response } from 'polka';

export function jsonParser() {
	return async (req: Request, _: Response, next: NextHandler) => {
		if (!req.headers['content-type']?.startsWith('application/json')) {
			return next(badRequest('unexpected content type'));
		}

		req.setEncoding('utf8');

		try {
			let data = '';
			for await (const chunk of req) {
				data += chunk;
			}

			if (data === '') {
				// eslint-disable-next-line n/callback-return
				await next();
				return;
			}

			req.body = JSON.parse(data) as unknown;

			// eslint-disable-next-line n/callback-return
			await next();
		} catch (error_) {
			const error = error_ as Error;
			return next(badData(error.message));
		}
	};
}
