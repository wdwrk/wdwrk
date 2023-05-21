import { createServer } from 'node:http';
import { isBoom, Boom, notFound } from '@hapi/boom';
import cors from 'cors';
import helmet from 'helmet';
import polka, { type Middleware } from 'polka';
import { migrate } from './database.js';
import { Env } from './env.js';
import { logger } from './logger.js';
import { registerRoute } from './route.js';
import * as routes from './routes/routes.js';

const app = polka({
	onError(err, _, res, __) {
		res.setHeader('Content-Type', 'application/json');
		const boom = isBoom(err) ? err : new Boom(err);

		if (boom.output.statusCode >= 500 && boom.output.statusCode < 600) {
			logger.error(boom);
		}

		res.statusCode = boom.output.statusCode;
		for (const [header, value] of Object.entries(boom.output.headers)) {
			res.setHeader(header, value!);
		}

		res.end(JSON.stringify(boom.output.payload));
	},
	onNoMatch(_, __, next) {
		// eslint-disable-next-line n/callback-return
		void next(notFound());
	},
	server: createServer(),
});

const env = Env.get();

app
	.use(
		cors({
			origin: env.cors,
			credentials: true,
		}),
	)
	.use(helmet({ contentSecurityPolicy: env.isProd ? undefined : false }) as Middleware);

for (const route of Object.values(routes)) {
	registerRoute(app, route);
}

await migrate();
app.listen(env.port, () => logger.info(`Listening on port ${env.port}`));
