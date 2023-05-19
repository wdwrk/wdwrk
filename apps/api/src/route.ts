import type { Middleware, Polka } from 'polka';

export interface Route {
	handler: Middleware;
	method: 'delete' | 'get' | 'patch' | 'post' | 'put';
	middleware: Middleware[];
	path: `/${string}`;
}

export function registerRoute(app: Polka, route: Route): void {
	app[route.method](route.path, ...route.middleware, route.handler);
}
