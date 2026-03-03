import {NativeBiometricAuthenticator, NullBiometricAuthenticator} from '../../biometric/authenticator';
import {Platform} from 'react-native';
import * as LocalAuth from 'expo-local-authentication';

describe('NullBiometricAuthenticator', () => {
    let authenticator: NullBiometricAuthenticator;

    beforeEach(() => {
        authenticator = new NullBiometricAuthenticator();
    });

    it('isAvailable returns false', async () => {
        const result = await authenticator.isAvailable();
        expect(result).toBe(false);
    });

    it('authenticate returns false', async () => {
        const result = await authenticator.authenticate('test prompt');
        expect(result).toBe(false);
    });
});

describe('NativeBiometricAuthenticator', () => {
    const originalPlatformOS = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        (Platform as any).OS = originalPlatformOS;
        jest.restoreAllMocks();
    });

    describe('loadLocalAuth on web platform', () => {
        it('should return null and isAvailable returns false on web', async () => {
            (Platform as any).OS = 'web';
            const authenticator = new NativeBiometricAuthenticator();

            const result = await authenticator.isAvailable();
            expect(result).toBe(false);
        });

        it('should return false for authenticate on web', async () => {
            (Platform as any).OS = 'web';
            const authenticator = new NativeBiometricAuthenticator();

            const result = await authenticator.authenticate('Test prompt');
            expect(result).toBe(false);
        });
    });

    describe('loadLocalAuth on native platform', () => {
        it('should load expo-local-authentication module on ios', () => {
            (Platform as any).OS = 'ios';
            const authenticator = new NativeBiometricAuthenticator();

            // The module was loaded - verify by checking isAvailable doesn't immediately return false
            // (it calls hasHardwareAsync which means the module was loaded)
            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
            return authenticator.isAvailable().then(result => {
                expect(LocalAuth.hasHardwareAsync).toHaveBeenCalled();
            });
        });

        it('should load expo-local-authentication module on android', () => {
            (Platform as any).OS = 'android';
            const authenticator = new NativeBiometricAuthenticator();

            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
            return authenticator.isAvailable().then(() => {
                expect(LocalAuth.hasHardwareAsync).toHaveBeenCalled();
            });
        });
    });

    describe('isAvailable', () => {
        let authenticator: NativeBiometricAuthenticator;

        beforeEach(() => {
            (Platform as any).OS = 'ios';
            authenticator = new NativeBiometricAuthenticator();
        });

        it('should return true when hardware exists and biometrics enrolled', async () => {
            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuth.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

            const result = await authenticator.isAvailable();
            expect(result).toBe(true);
        });

        it('should return false when no hardware available', async () => {
            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

            const result = await authenticator.isAvailable();
            expect(result).toBe(false);
            expect(LocalAuth.isEnrolledAsync).not.toHaveBeenCalled();
        });

        it('should return false when hardware exists but not enrolled', async () => {
            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuth.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

            const result = await authenticator.isAvailable();
            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync throws', async () => {
            (LocalAuth.hasHardwareAsync as jest.Mock).mockRejectedValue(
                new Error('Hardware check failed')
            );

            const result = await authenticator.isAvailable();
            expect(result).toBe(false);
        });

        it('should return false when isEnrolledAsync throws', async () => {
            (LocalAuth.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
            (LocalAuth.isEnrolledAsync as jest.Mock).mockRejectedValue(
                new Error('Enrollment check failed')
            );

            const result = await authenticator.isAvailable();
            expect(result).toBe(false);
        });

        it('should return false when localAuth module is not loaded', async () => {
            (Platform as any).OS = 'web';
            const webAuthenticator = new NativeBiometricAuthenticator();

            const result = await webAuthenticator.isAvailable();
            expect(result).toBe(false);
            expect(LocalAuth.hasHardwareAsync).not.toHaveBeenCalled();
        });
    });

    describe('authenticate', () => {
        let authenticator: NativeBiometricAuthenticator;

        beforeEach(() => {
            (Platform as any).OS = 'ios';
            authenticator = new NativeBiometricAuthenticator();
        });

        it('should return true on successful authentication', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockResolvedValue({
                success: true,
            });

            const result = await authenticator.authenticate('Verify identity');
            expect(result).toBe(true);
        });

        it('should pass correct options to authenticateAsync', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockResolvedValue({
                success: true,
            });

            await authenticator.authenticate('Custom prompt');

            expect(LocalAuth.authenticateAsync).toHaveBeenCalledWith({
                promptMessage: 'Custom prompt',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
        });

        it('should return false when authentication fails', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockResolvedValue({
                success: false,
            });

            const result = await authenticator.authenticate('Test');
            expect(result).toBe(false);
        });

        it('should return false when authenticateAsync throws', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockRejectedValue(
                new Error('Auth error')
            );

            const result = await authenticator.authenticate('Test');
            expect(result).toBe(false);
        });

        it('should return false when result has no success field', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockResolvedValue({});

            const result = await authenticator.authenticate('Test');
            expect(result).toBe(false);
        });

        it('should return false when result is null', async () => {
            (LocalAuth.authenticateAsync as jest.Mock).mockResolvedValue(null);

            const result = await authenticator.authenticate('Test');
            expect(result).toBe(false);
        });

        it('should return false when localAuth module is not loaded', async () => {
            (Platform as any).OS = 'web';
            const webAuthenticator = new NativeBiometricAuthenticator();

            const result = await webAuthenticator.authenticate('Test');
            expect(result).toBe(false);
            expect(LocalAuth.authenticateAsync).not.toHaveBeenCalled();
        });
    });
});
