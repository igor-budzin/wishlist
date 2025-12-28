// Type declaration for passport-strategy
declare module 'passport-strategy' {
  export class Strategy {
    name?: string;
    success(user: unknown, info?: unknown): void;
    fail(challenge: unknown, status?: number): void;
    error(err: Error): void;
    authenticate(req: unknown, options?: unknown): void;
  }
}
