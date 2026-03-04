import {SecureTokenStorage} from '../../token/storage-adapter';
import {getItem, removeItem, setItem} from '@yuhuu/storage';

jest.mock('@yuhuu/storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe('SecureTokenStorage', () => {
    let storage: SecureTokenStorage;

    beforeEach(() => {
        jest.clearAllMocks();
        storage = new SecureTokenStorage();
    });

    describe('saveAccessToken', () => {
        it('should delegate to setItem with access_token key', async () => {
            (setItem as jest.Mock).mockResolvedValue(undefined);

            await storage.saveAccessToken('my-access-token');

            expect(setItem).toHaveBeenCalledWith('access_token', 'my-access-token');
            expect(setItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadAccessToken', () => {
        it('should delegate to getItem with access_token key', async () => {
            (getItem as jest.Mock).mockResolvedValue('stored-token');

            const result = await storage.loadAccessToken();

            expect(getItem).toHaveBeenCalledWith('access_token');
            expect(result).toBe('stored-token');
        });

        it('should return null when no token is stored', async () => {
            (getItem as jest.Mock).mockResolvedValue(null);

            const result = await storage.loadAccessToken();

            expect(result).toBeNull();
        });
    });

    describe('clearAccessToken', () => {
        it('should delegate to removeItem with access_token key', async () => {
            (removeItem as jest.Mock).mockResolvedValue(undefined);

            await storage.clearAccessToken();

            expect(removeItem).toHaveBeenCalledWith('access_token');
            expect(removeItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('saveRefreshToken', () => {
        it('should delegate to setItem with refresh_token key', async () => {
            (setItem as jest.Mock).mockResolvedValue(undefined);

            await storage.saveRefreshToken('my-refresh-token');

            expect(setItem).toHaveBeenCalledWith('refresh_token', 'my-refresh-token');
            expect(setItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('loadRefreshToken', () => {
        it('should delegate to getItem with refresh_token key', async () => {
            (getItem as jest.Mock).mockResolvedValue('stored-refresh');

            const result = await storage.loadRefreshToken();

            expect(getItem).toHaveBeenCalledWith('refresh_token');
            expect(result).toBe('stored-refresh');
        });

        it('should return null when no refresh token is stored', async () => {
            (getItem as jest.Mock).mockResolvedValue(null);

            const result = await storage.loadRefreshToken();

            expect(result).toBeNull();
        });
    });

    describe('clearRefreshToken', () => {
        it('should delegate to removeItem with refresh_token key', async () => {
            (removeItem as jest.Mock).mockResolvedValue(undefined);

            await storage.clearRefreshToken();

            expect(removeItem).toHaveBeenCalledWith('refresh_token');
            expect(removeItem).toHaveBeenCalledTimes(1);
        });
    });
});
