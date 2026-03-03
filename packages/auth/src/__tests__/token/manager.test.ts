import {TokenManager} from '../../token/manager';
import type {IJwtValidator, INavigator, ITokenRefreshClient, ITokenStorage} from '../../token/types';

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

function createMockValidator(overrides: Partial<IJwtValidator> = {}): IJwtValidator {
    return {
        getExpirationTime: jest.fn().mockReturnValue(Date.now() + 3600_000),
        isValid: jest.fn().mockReturnValue(true),
        ...overrides,
    };
}

function createMockStorage(overrides: Partial<ITokenStorage> = {}): ITokenStorage {
    return {
        saveAccessToken: jest.fn().mockResolvedValue(undefined),
        loadAccessToken: jest.fn().mockResolvedValue(null),
        clearAccessToken: jest.fn().mockResolvedValue(undefined),
        saveRefreshToken: jest.fn().mockResolvedValue(undefined),
        loadRefreshToken: jest.fn().mockResolvedValue(null),
        clearRefreshToken: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

function createMockRefreshClient(overrides: Partial<ITokenRefreshClient> = {}): ITokenRefreshClient {
    return {
        refresh: jest.fn().mockResolvedValue({accessToken: 'refreshed-token'}),
        ...overrides,
    };
}

function createMockNavigator(overrides: Partial<INavigator> = {}): INavigator {
    return {
        isAuthPath: jest.fn().mockReturnValue(false),
        redirectToLogin: jest.fn(),
        ...overrides,
    };
}

describe('TokenManager', () => {
    let manager: TokenManager;
    let mockValidator: IJwtValidator;
    let mockStorage: ITokenStorage;
    let mockRefreshClient: ITokenRefreshClient;
    let mockNavigator: INavigator;

    beforeEach(() => {
        mockValidator = createMockValidator();
        mockStorage = createMockStorage();
        mockRefreshClient = createMockRefreshClient();
        mockNavigator = createMockNavigator();
        manager = new TokenManager(mockValidator, mockStorage, mockRefreshClient, mockNavigator);
    });

    describe('setTokensFromLogin', () => {
        it('stores access token in memory and storage', async () => {
            await manager.setTokensFromLogin('access-123');
            expect(mockStorage.saveAccessToken).toHaveBeenCalledWith('access-123');
            expect(manager.getAccessTokenSync()).toBe('access-123');
        });

        it('stores refresh token when provided', async () => {
            await manager.setTokensFromLogin('access-123', 'refresh-456');
            expect(mockStorage.saveRefreshToken).toHaveBeenCalledWith('refresh-456');
        });

        it('does not store refresh token when not provided', async () => {
            await manager.setTokensFromLogin('access-123');
            expect(mockStorage.saveRefreshToken).not.toHaveBeenCalled();
        });
    });

    describe('clearTokens', () => {
        it('clears in-memory token', async () => {
            await manager.setTokensFromLogin('access-123');
            await manager.clearTokens();
            expect(manager.getAccessTokenSync()).toBeNull();
        });

        it('clears stored tokens', async () => {
            await manager.clearTokens();
            expect(mockStorage.clearAccessToken).toHaveBeenCalled();
            expect(mockStorage.clearRefreshToken).toHaveBeenCalled();
        });
    });

    describe('getAccessTokenSync', () => {
        it('returns null when no token set', () => {
            expect(manager.getAccessTokenSync()).toBeNull();
        });

        it('returns token after login', async () => {
            await manager.setTokensFromLogin('my-token');
            expect(manager.getAccessTokenSync()).toBe('my-token');
        });
    });

    describe('getValidAccessToken', () => {
        it('returns in-memory token when valid', async () => {
            // Set a token that will be considered valid
            (mockValidator.getExpirationTime as jest.Mock).mockReturnValue(Date.now() + 3600_000);
            await manager.setTokensFromLogin('valid-token');

            const result = await manager.getValidAccessToken();
            expect(result).toBe('valid-token');
        });

        it('loads token from storage when not in memory', async () => {
            (mockStorage.loadAccessToken as jest.Mock).mockResolvedValue('stored-token');
            (mockValidator.getExpirationTime as jest.Mock).mockReturnValue(Date.now() + 3600_000);

            const result = await manager.getValidAccessToken();
            expect(result).toBe('stored-token');
            expect(mockStorage.loadAccessToken).toHaveBeenCalled();
        });

        it('returns null on auth paths without refreshing', async () => {
            (mockNavigator.isAuthPath as jest.Mock).mockReturnValue(true);

            const result = await manager.getValidAccessToken();
            expect(result).toBeNull();
            expect(mockRefreshClient.refresh).not.toHaveBeenCalled();
        });

        it('refreshes token when expired and not on auth path', async () => {
            // No token in memory, nothing in storage
            (mockStorage.loadAccessToken as jest.Mock).mockResolvedValue(null);
            (mockRefreshClient.refresh as jest.Mock).mockResolvedValue({
                accessToken: 'refreshed-token',
            });
            (mockValidator.getExpirationTime as jest.Mock).mockReturnValue(Date.now() + 3600_000);

            const result = await manager.getValidAccessToken();
            expect(result).toBe('refreshed-token');
            expect(mockRefreshClient.refresh).toHaveBeenCalled();
        });

        it('redirects to login on refresh failure', async () => {
            (mockStorage.loadAccessToken as jest.Mock).mockResolvedValue(null);
            (mockRefreshClient.refresh as jest.Mock).mockRejectedValue(new Error('401'));

            const result = await manager.getValidAccessToken();
            expect(result).toBeNull();
            expect(mockNavigator.redirectToLogin).toHaveBeenCalled();
        });
    });

    describe('refreshAccessToken', () => {
        it('calls refresh client and stores new token', async () => {
            (mockRefreshClient.refresh as jest.Mock).mockResolvedValue({
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
            });
            (mockValidator.getExpirationTime as jest.Mock).mockReturnValue(Date.now() + 3600_000);

            const result = await manager.refreshAccessToken();
            expect(result).toBe('new-access');
            expect(mockStorage.saveAccessToken).toHaveBeenCalledWith('new-access');
            expect(mockStorage.saveRefreshToken).toHaveBeenCalledWith('new-refresh');
        });

        it('handles null response from refresh', async () => {
            (mockRefreshClient.refresh as jest.Mock).mockResolvedValue(null);

            const result = await manager.refreshAccessToken();
            expect(result).toBeNull();
            expect(mockNavigator.redirectToLogin).toHaveBeenCalled();
        });
    });
});
