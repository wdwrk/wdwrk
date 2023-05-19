import process from 'node:process';

export class Env {
	private static instance?: Env;

	public static get(): Env {
		return (this.instance ??= new Env());
	}

	public readonly port: number = Number(process.env.PORT ?? '3000');

	public readonly isProd: boolean = process.env.NODE_ENV === 'prod';

	public readonly cors: string[] = process.env.CORS?.split(',') ?? [];

	public readonly postgresHost: string = process.env.POSTGRES_HOST!;

	public readonly postgresPort: number = Number(process.env.POSTGRES_PORT ?? '5432');

	public readonly postgresUser: string = process.env.POSTGRES_USER!;

	public readonly postgresPassword: string = process.env.POSTGRES_PASSWORD!;

	public readonly postgresDatabase: string = process.env.POSTGRES_DATABASE!;

	private readonly requiredKeys = ['POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DATABASE'] as const;

	private constructor() {
		for (const key of this.requiredKeys) {
			if (!(key in process.env) === undefined) {
				throw new Error(`Missing environment variable: ${key}`);
			}
		}
	}
}
