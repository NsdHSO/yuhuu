import {hasAnyPermission, hasAnyRole, hasPermission, hasRole, readClaims} from '../../authz/authz';
import {getAccessTokenSync} from '../../token';

// Mock the token module
jest.mock('../../token', () => ({
    getAccessTokenSync: jest.fn(),
}));

const mockGetAccessTokenSync = getAccessTokenSync as jest.MockedFunction<typeof getAccessTokenSync>;

// Helper to create a JWT token with given payload
function createTestToken(payload: Record<string, unknown>): string {
    const header = {alg: 'HS256', typ: 'JWT'};
    const encode = (obj: unknown) =>
        Buffer.from(JSON.stringify(obj)).toString('base64url');
    return `${encode(header)}.${encode(payload)}.fake-signature`;
}

describe('authz', () => {
    beforeEach(() => {
        mockGetAccessTokenSync.mockReset();
    });

    describe('readClaims', () => {
        it('returns null when no token', () => {
            mockGetAccessTokenSync.mockReturnValue(null);
            expect(readClaims()).toBeNull();
        });

        it('returns decoded claims from token', () => {
            const token = createTestToken({roles: ['admin'], sub: 'user-1'});
            mockGetAccessTokenSync.mockReturnValue(token);
            const claims = readClaims();
            expect(claims).toEqual(expect.objectContaining({roles: ['admin'], sub: 'user-1'}));
        });

        it('returns null for invalid token', () => {
            mockGetAccessTokenSync.mockReturnValue('invalid');
            expect(readClaims()).toBeNull();
        });
    });

    describe('hasRole', () => {
        it('returns false when no token', () => {
            mockGetAccessTokenSync.mockReturnValue(null);
            expect(hasRole('admin')).toBe(false);
        });

        it('returns true when role exists in roles array', () => {
            const token = createTestToken({roles: ['admin', 'user']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasRole('admin')).toBe(true);
        });

        it('returns true when role exists in role array', () => {
            const token = createTestToken({role: ['admin', 'user']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasRole('admin')).toBe(true);
        });

        it('returns true when role is a string match', () => {
            const token = createTestToken({role: 'admin'});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasRole('admin')).toBe(true);
        });

        it('is case-insensitive', () => {
            const token = createTestToken({roles: ['Admin']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasRole('ADMIN')).toBe(true);
        });

        it('returns false for non-matching role', () => {
            const token = createTestToken({roles: ['user']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasRole('admin')).toBe(false);
        });
    });

    describe('hasAnyRole', () => {
        it('returns true when any role matches', () => {
            const token = createTestToken({roles: ['editor']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasAnyRole(['admin', 'editor'])).toBe(true);
        });

        it('returns false when no roles match', () => {
            const token = createTestToken({roles: ['viewer']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasAnyRole(['admin', 'editor'])).toBe(false);
        });
    });

    describe('hasPermission', () => {
        it('returns false when no token', () => {
            mockGetAccessTokenSync.mockReturnValue(null);
            expect(hasPermission('read:users')).toBe(false);
        });

        it('returns true when permission exists in permissions array', () => {
            const token = createTestToken({permissions: ['read:users', 'write:users']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasPermission('read:users')).toBe(true);
        });

        it('returns true when permission exists in perms array', () => {
            const token = createTestToken({perms: ['read:users']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasPermission('read:users')).toBe(true);
        });

        it('is case-insensitive', () => {
            const token = createTestToken({permissions: ['Read:Users']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasPermission('read:users')).toBe(true);
        });
    });

    describe('hasAnyPermission', () => {
        it('returns true when any permission matches', () => {
            const token = createTestToken({permissions: ['write:users']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasAnyPermission(['read:users', 'write:users'])).toBe(true);
        });

        it('returns false when no permissions match', () => {
            const token = createTestToken({permissions: ['read:posts']});
            mockGetAccessTokenSync.mockReturnValue(token);
            expect(hasAnyPermission(['read:users', 'write:users'])).toBe(false);
        });
    });
});
