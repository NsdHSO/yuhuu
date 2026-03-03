/**
 * Re-export biometric authentication from @yuhuu/auth package
 * This maintains backwards compatibility with old @/lib/biometricAuth imports
 */
export {
    isBiometricAvailable,
    authenticateWithBiometrics,
    saveBiometricPreference,
    getBiometricPreference,
    saveBiometricEmail,
    getBiometricEmail,
    clearBiometricData,
    __setServiceForTesting,
    __resetServiceForTesting,
} from '@yuhuu/auth';
