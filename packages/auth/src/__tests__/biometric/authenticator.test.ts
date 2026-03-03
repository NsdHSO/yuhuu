import {NullBiometricAuthenticator} from '../../biometric/authenticator';

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
