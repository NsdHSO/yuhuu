import {JwtTokenValidator} from '../../token/validator';

// Helper to create a JWT token with a given expiration
function createTestToken(exp?: number): string {
    const header = {alg: 'HS256', typ: 'JWT'};
    const payload: Record<string, unknown> = {};
    if (exp !== undefined) {
        payload.exp = exp;
    }
    const encode = (obj: unknown) =>
        Buffer.from(JSON.stringify(obj)).toString('base64url');
    return `${encode(header)}.${encode(payload)}.fake-signature`;
}

describe('JwtTokenValidator', () => {
    let validator: JwtTokenValidator;

    beforeEach(() => {
        validator = new JwtTokenValidator();
    });

    describe('getExpirationTime', () => {
        it('returns expiration time in milliseconds', () => {
            const expInSeconds = Math.floor(Date.now() / 1000) + 3600;
            const token = createTestToken(expInSeconds);
            const result = validator.getExpirationTime(token);
            expect(result).toBe(expInSeconds * 1000);
        });

        it('returns null when no exp claim', () => {
            const token = createTestToken();
            const result = validator.getExpirationTime(token);
            expect(result).toBeNull();
        });

        it('returns null for invalid token', () => {
            const result = validator.getExpirationTime('invalid-token');
            expect(result).toBeNull();
        });
    });

    describe('isValid', () => {
        it('returns false for empty string', () => {
            expect(validator.isValid('', 30_000)).toBe(false);
        });

        it('returns true for token without expiration', () => {
            const token = createTestToken();
            expect(validator.isValid(token, 30_000)).toBe(true);
        });

        it('returns true for non-expired token', () => {
            const futureExp = Math.floor(Date.now() / 1000) + 3600;
            const token = createTestToken(futureExp);
            expect(validator.isValid(token, 30_000)).toBe(true);
        });

        it('returns false for expired token', () => {
            const pastExp = Math.floor(Date.now() / 1000) - 3600;
            const token = createTestToken(pastExp);
            expect(validator.isValid(token, 30_000)).toBe(false);
        });

        it('returns false when within buffer window', () => {
            // Token expires in 15 seconds but buffer is 30 seconds
            const soonExp = Math.floor(Date.now() / 1000) + 15;
            const token = createTestToken(soonExp);
            expect(validator.isValid(token, 30_000)).toBe(false);
        });

        it('uses default buffer of 30 seconds', () => {
            const soonExp = Math.floor(Date.now() / 1000) + 15;
            const token = createTestToken(soonExp);
            expect(validator.isValid(token)).toBe(false);
        });
    });
});
