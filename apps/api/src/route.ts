import type { Middleware, Polka } from 'polka';
import { logger } from './logger.js';

export interface Route {
	handler: Middleware;
	method: 'delete' | 'get' | 'patch' | 'post' | 'put';
	middleware: Middleware[];
	path: `/${string}`;
}

export function registerRoute(app: Polka, route: Route): void {
	logger.info({ path: route.path, method: route.method }, 'Registering route');
	app[route.method](route.path, ...route.middleware, route.handler);
}
