import {BiometricService} from '../../biometric/service';
import type {IBiometricAuthenticator, ISecureStorage} from '../../biometric/types';

function createMockAuthenticator(overrides: Partial<IBiometricAuthenticator> = {}): IBiometricAuthenticator {
    return {
        isAvailable: jest.fn().mockResolvedValue(true),
        authenticate: jest.fn().mockResolvedValue(true),
        ...overrides,
    };
}

function createMockStorage(overrides: Partial<ISecureStorage> = {}): ISecureStorage {
    const store = new Map<string, string>();
    return {
        setItem: jest.fn(async (key, value) => {
            store.set(key, value);
        }),
        getItem: jest.fn(async (key) => store.get(key) ?? null),
        deleteItem: jest.fn(async (key) => {
            store.delete(key);
        }),
        ...overrides,
    };
}

describe('BiometricService', () => {
    let service: BiometricService;
    let mockAuth: IBiometricAuthenticator;
    let mockStorage: ISecureStorage;

    beforeEach(() => {
        mockAuth = createMockAuthenticator();
        mockStorage = createMockStorage();
        service = new BiometricService(mockAuth, mockStorage);
    });

    describe('isAvailable', () => {
        it('delegates to authenticator', async () => {
            const result = await service.isAvailable();
            expect(result).toBe(true);
            expect(mockAuth.isAvailable).toHaveBeenCalled();
        });

        it('returns false when authenticator says unavailable', async () => {
            mockAuth = createMockAuthenticator({isAvailable: jest.fn().mockResolvedValue(false)});
            service = new BiometricService(mockAuth, mockStorage);
            const result = await service.isAvailable();
            expect(result).toBe(false);
        });
    });

    describe('authenticate', () => {
        it('delegates to authenticator with default prompt', async () => {
            const result = await service.authenticate();
            expect(result).toBe(true);
            expect(mockAuth.authenticate).toHaveBeenCalledWith('Authenticate to sign in');
        });

        it('delegates to authenticator with custom prompt', async () => {
            await service.authenticate('Custom prompt');
            expect(mockAuth.authenticate).toHaveBeenCalledWith('Custom prompt');
        });

        it('returns false on auth failure', async () => {
            mockAuth = createMockAuthenticator({authenticate: jest.fn().mockResolvedValue(false)});
            service = new BiometricService(mockAuth, mockStorage);
            const result = await service.authenticate('test');
            expect(result).toBe(false);
        });
    });

    describe('savePreference / getPreference', () => {
        it('saves and retrieves true', async () => {
            await service.savePreference(true);
            expect(mockStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'true');
            const pref = await service.getPreference();
            expect(pref).toBe(true);
        });

        it('saves and retrieves false', async () => {
            await service.savePreference(false);
            expect(mockStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'false');
            const pref = await service.getPreference();
            expect(pref).toBe(false);
        });

        it('returns false when no preference stored', async () => {
            const pref = await service.getPreference();
            expect(pref).toBe(false);
        });
    });

    describe('saveEmail / getEmail', () => {
        it('saves and retrieves email', async () => {
            await service.saveEmail('user@example.com');
            expect(mockStorage.setItem).toHaveBeenCalledWith('biometric_email', 'user@example.com');
            const email = await service.getEmail();
            expect(email).toBe('user@example.com');
        });

        it('returns null when no email stored', async () => {
            const email = await service.getEmail();
            expect(email).toBeNull();
        });
    });

    describe('clearData', () => {
        it('clears both preference and email', async () => {
            await service.savePreference(true);
            await service.saveEmail('user@example.com');
            await service.clearData();
            expect(mockStorage.deleteItem).toHaveBeenCalledWith('biometric_enabled');
            expect(mockStorage.deleteItem).toHaveBeenCalledWith('biometric_email');
        });
    });
});
