import { injectable } from 'inversify';

export interface IConfigService {
  get(key: string): string | undefined;
  getOrThrow(key: string): string;
  isDevelopment(): boolean;
  isProduction(): boolean;
  getPort(): number;
  getDatabaseUrl(): string;
}

@injectable()
export class ConfigService implements IConfigService {
  get(key: string): string | undefined {
    return process.env[key];
  }

  getOrThrow(key: string): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  getPort(): number {
    return parseInt(this.get('PORT') || '3001', 10);
  }

  getDatabaseUrl(): string {
    return this.getOrThrow('DATABASE_URL');
  }
}
