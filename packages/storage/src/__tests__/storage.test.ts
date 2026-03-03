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
