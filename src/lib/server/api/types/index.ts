import type { Session, User } from 'lucia';
import type { Promisify, RateLimitInfo } from 'hono-rate-limiter';

export type HonoTypes = {
	Variables: {
		session: Session | null;
		user: User | null;
		rateLimit: RateLimitInfo;
		rateLimitStore: {
			getKey?: (key: string) => Promisify<RateLimitInfo | undefined>;
			resetKey: (key: string) => Promisify<void>;
		};
	};
};

export type SendTemplate<T> = {
	to: string | string[];
	props: T;
};
