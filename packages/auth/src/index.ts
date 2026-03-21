// Biometric
export {
    isBiometricAvailable,
    authenticateWithBiometrics,
    saveBiometricPreference,
    getBiometricPreference,
    saveBiometricEmail,
    getBiometricEmail,
    clearBiometricEmail,
    clearBiometricData,
    __setServiceForTesting,
    __resetServiceForTesting,
    BiometricService,
    BiometricServiceFactory,
    NativeBiometricAuthenticator,
    NullBiometricAuthenticator,
    NativeSecureStorageAdapter,
    WebStorageAdapter,
    NullStorageAdapter,
} from './biometric';
export type {IBiometricAuthenticator, ISecureStorage} from './biometric';

// Token
export {
    setTokensFromLogin,
    clearTokens,
    getAccessTokenSync,
    getValidAccessToken,
    refreshAccessToken,
    __setManagerForTesting,
    __resetManagerForTesting,
    TokenManager,
    TokenManagerFactory,
    JwtTokenValidator,
    SecureTokenStorage,
    TokenRefreshClient,
    TokenRefreshCoordinator,
} from './token';
export type {IJwtValidator, ITokenStorage, ITokenRefreshClient, INavigator, TokenPair} from './token';

// Authz
export {readClaims, hasRole, hasAnyRole, hasPermission, hasAnyPermission} from './authz';
export type {Claims} from './authz';

// Nav
export {isAuthPath, redirectToLogin, AuthNavigator} from './nav';

// API
export {authApi, appApi, AUTH_BASE, APP_BASE, unwrap} from './api';
