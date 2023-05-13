import process from 'node:process';

export class Env {
	private static instance?: Env;

	public static get(): Env {
		return (this.instance ??= new Env());
	}

	private constructor() {}

	public readonly port: number = Number(process.env.PORT ?? '3000');

	public readonly isProd: boolean = process.env.NODE_ENV === 'prod';

	public readonly cors: string[] = process.env.CORS?.split(',') ?? [];
}
