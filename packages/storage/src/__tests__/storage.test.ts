import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {getItem, removeItem, setItem} from '../storage';

jest.mock('react-native', () => ({
    Platform: {OS: 'ios'},
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('storage - native (iOS/Android)', () => {
    beforeEach(() => {
        (Platform as any).OS = 'ios';
    });

    describe('getItem', () => {
        it('should call SecureStore.getItemAsync', async () => {
            mockSecureStore.getItemAsync.mockResolvedValue('test-value');
            const result = await getItem('test-key');
            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('test-key');
            expect(result).toBe('test-value');
        });

        it('should return null when SecureStore.getItemAsync fails', async () => {
            mockSecureStore.getItemAsync.mockRejectedValue(new Error('fail'));
            const result = await getItem('test-key');
            expect(result).toBeNull();
        });
    });

    describe('setItem', () => {
        it('should call SecureStore.setItemAsync', async () => {
            mockSecureStore.setItemAsync.mockResolvedValue();
            await setItem('test-key', 'test-value');
            expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
        });

        it('should not throw when SecureStore.setItemAsync fails', async () => {
            mockSecureStore.setItemAsync.mockRejectedValue(new Error('fail'));
            await expect(setItem('test-key', 'test-value')).resolves.toBeUndefined();
        });
    });

    describe('removeItem', () => {
        it('should call SecureStore.deleteItemAsync', async () => {
            mockSecureStore.deleteItemAsync.mockResolvedValue();
            await removeItem('test-key');
            expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
        });

        it('should not throw when SecureStore.deleteItemAsync fails', async () => {
            mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('fail'));
            await expect(removeItem('test-key')).resolves.toBeUndefined();
        });
    });
});

describe('key validation', () => {
    beforeEach(() => {
        (Platform as any).OS = 'ios';
    });

    describe('valid keys', () => {
        const validKeys = [
            'test-key',
            'my_key',
            'app.config.theme',
            'a',
            'a.b-c_d',
            '123',
            'UPPER_CASE',
        ];

        it.each(validKeys)('getItem should accept valid key "%s"', async (key) => {
            mockSecureStore.getItemAsync.mockResolvedValue('value');
            await getItem(key);
            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(key);
        });

        it.each(validKeys)('setItem should accept valid key "%s"', async (key) => {
            mockSecureStore.setItemAsync.mockResolvedValue();
            await setItem(key, 'value');
            expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(key, 'value');
        });

        it.each(validKeys)('removeItem should accept valid key "%s"', async (key) => {
            mockSecureStore.deleteItemAsync.mockResolvedValue();
            await removeItem(key);
            expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
        });
    });

    describe('invalid keys', () => {
        const invalidKeys = [
            ['empty string', ''],
            ['whitespace only', '  '],
            ['spaces', 'key with spaces'],
            ['@ symbol', 'key@special'],
            ['hash', 'key#hash'],
            ['slash', 'key/slash'],
            ['dollar sign', 'key$dollar'],
            ['exclamation', 'key!bang'],
        ];

        it.each(invalidKeys)('getItem should return null for %s key', async (_desc, key) => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const result = await getItem(key);
            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid storage key'));
            expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it.each(invalidKeys)('setItem should return without storing for %s key', async (_desc, key) => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            await setItem(key, 'value');
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid storage key'));
            expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it.each(invalidKeys)('removeItem should return without deleting for %s key', async (_desc, key) => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            await removeItem(key);
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid storage key'));
            expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });
});

describe('storage - web', () => {
    const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    };

    beforeEach(() => {
        (Platform as any).OS = 'web';
        Object.defineProperty(global, 'localStorage', {
            value: mockLocalStorage,
            writable: true,
            configurable: true,
        });
        mockLocalStorage.getItem.mockReset();
        mockLocalStorage.setItem.mockReset();
        mockLocalStorage.removeItem.mockReset();
    });

    describe('getItem', () => {
        it('should call localStorage.getItem', async () => {
            mockLocalStorage.getItem.mockReturnValue('web-value');
            const result = await getItem('test-key');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
            expect(result).toBe('web-value');
        });

        it('should return null when localStorage.getItem fails', async () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('fail');
            });
            const result = await getItem('test-key');
            expect(result).toBeNull();
        });
    });

    describe('setItem', () => {
        it('should call localStorage.setItem', async () => {
            await setItem('test-key', 'test-value');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
        });

        it('should not throw when localStorage.setItem fails', async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('fail');
            });
            await expect(setItem('test-key', 'test-value')).resolves.toBeUndefined();
        });
    });

    describe('removeItem', () => {
        it('should call localStorage.removeItem', async () => {
            await removeItem('test-key');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
        });

        it('should not throw when localStorage.removeItem fails', async () => {
            mockLocalStorage.removeItem.mockImplementation(() => {
                throw new Error('fail');
            });
            await expect(removeItem('test-key')).resolves.toBeUndefined();
        });
    });
});
