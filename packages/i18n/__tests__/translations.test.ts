import en from '../locales/en.json';
import ro from '../locales/ro.json';

describe('Translation Files', () => {
    function getKeys(obj: any, prefix = ''): string[] {
        return Object.keys(obj).reduce((keys: string[], key) => {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                return [...keys, ...getKeys(obj[key], newPrefix)];
            }
            return [...keys, newPrefix];
        }, []);
    }

    it('should have matching keys in both languages', () => {
        const enKeys = getKeys(en).sort();
        const roKeys = getKeys(ro).sort();

        expect(enKeys).toEqual(roKeys);
    });

    it('should not have empty string values in English', () => {
        const checkEmptyValues = (obj: any, path = ''): string[] => {
            return Object.keys(obj).reduce((empty: string[], key) => {
                const currentPath = path ? `${path}.${key}` : key;
                if (typeof obj[key] === 'string' && obj[key].trim() === '') {
                    return [...empty, currentPath];
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    return [...empty, ...checkEmptyValues(obj[key], currentPath)];
                }
                return empty;
            }, []);
        };

        const emptyKeys = checkEmptyValues(en);
        expect(emptyKeys).toEqual([]);
    });

    it('should not have empty string values in Romanian', () => {
        const checkEmptyValues = (obj: any, path = ''): string[] => {
            return Object.keys(obj).reduce((empty: string[], key) => {
                const currentPath = path ? `${path}.${key}` : key;
                if (typeof obj[key] === 'string' && obj[key].trim() === '') {
                    return [...empty, currentPath];
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    return [...empty, ...checkEmptyValues(obj[key], currentPath)];
                }
                return empty;
            }, []);
        };

        const emptyKeys = checkEmptyValues(ro);
        expect(emptyKeys).toEqual([]);
    });

    it('should have matching interpolation placeholders', () => {
        const getPlaceholders = (str: string): string[] => {
            const matches = str.match(/\{\{([^}]+)\}\}/g);
            return matches ? matches.sort() : [];
        };

        const checkPlaceholders = (enObj: any, roObj: any, path = '') => {
            Object.keys(enObj).forEach((key) => {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof enObj[key] === 'string') {
                    const enPlaceholders = getPlaceholders(enObj[key]);
                    const roPlaceholders = getPlaceholders(roObj[key]);

                    expect(roPlaceholders).toEqual(enPlaceholders);
                } else if (typeof enObj[key] === 'object' && enObj[key] !== null) {
                    checkPlaceholders(enObj[key], roObj[key], currentPath);
                }
            });
        };

        checkPlaceholders(en, ro);
    });

    describe('required namespaces', () => {
        it('should have auth namespace with login and register', () => {
            expect(en).toHaveProperty('auth');
            expect(en.auth).toHaveProperty('login');
            expect(en.auth).toHaveProperty('register');
        });

        it('should have profile namespace', () => {
            expect(en).toHaveProperty('profile');
        });

        it('should have admin namespace', () => {
            expect(en).toHaveProperty('admin');
        });

        it('should have common namespace', () => {
            expect(en).toHaveProperty('common');
        });

        it('should have language namespace', () => {
            expect(en).toHaveProperty('language');
        });

        it('should have supper namespace', () => {
            expect(en).toHaveProperty('supper');
        });

        it('should have home namespace', () => {
            expect(en).toHaveProperty('home');
        });

        it('should have modal namespace', () => {
            expect(en).toHaveProperty('modal');
            expect(ro).toHaveProperty('modal');
        });

        it('should have errors namespace', () => {
            expect(en).toHaveProperty('errors');
            expect(ro).toHaveProperty('errors');
        });

        it('should have tabs namespace', () => {
            expect(en).toHaveProperty('tabs');
            expect(ro).toHaveProperty('tabs');
        });
    });

    describe('login screen keys', () => {
        it('should have title, welcome, and submit text', () => {
            expect(en.auth.login.title).toBeDefined();
            expect(en.auth.login.welcome).toBeDefined();
            expect(en.auth.login.submit).toBeDefined();
            expect(en.auth.login.submitting).toBeDefined();
        });

        it('should have form placeholders', () => {
            expect(en.auth.login.emailPlaceholder).toBeDefined();
            expect(en.auth.login.passwordPlaceholder).toBeDefined();
        });

        it('should have biometric login keys', () => {
            expect(en.auth.login.biometricButton).toBeDefined();
            expect(en.auth.login.biometricButtonAndroid).toBeDefined();
            expect(en.auth.login.biometricDivider).toBeDefined();
        });

        it('should have error messages', () => {
            expect(en.auth.login.missingFields).toBeDefined();
            expect(en.auth.login.error).toBeDefined();
            expect(en.auth.login.biometricError).toBeDefined();
        });
    });

    describe('register screen keys', () => {
        it('should have title and form fields', () => {
            expect(en.auth.register.title).toBeDefined();
            expect(en.auth.register.createAccount).toBeDefined();
            expect(en.auth.register.emailPlaceholder).toBeDefined();
            expect(en.auth.register.passwordPlaceholder).toBeDefined();
            expect(en.auth.register.confirmPassword).toBeDefined();
        });

        it('should have validation messages', () => {
            expect(en.auth.register.missingFields).toBeDefined();
            expect(en.auth.register.passwordMismatchTitle).toBeDefined();
            expect(en.auth.register.passwordMismatch).toBeDefined();
            expect(en.auth.register.termsRequired).toBeDefined();
        });

        it('should have success and error messages', () => {
            expect(en.auth.register.success).toBeDefined();
            expect(en.auth.register.error).toBeDefined();
        });
    });

    describe('profile screen keys', () => {
        it('should have form and biometric settings', () => {
            expect(en.profile.title).toBeDefined();
            expect(en.profile.firstNamePlaceholder).toBeDefined();
            expect(en.profile.biometricLabel).toBeDefined();
            expect(en.profile.biometricLabelAndroid).toBeDefined();
            expect(en.profile.security).toBeDefined();
        });

        it('should have save/load messages', () => {
            expect(en.profile.save).toBeDefined();
            expect(en.profile.saveSuccess).toBeDefined();
            expect(en.profile.saveError).toBeDefined();
            expect(en.profile.loadError).toBeDefined();
        });
    });

    describe('modal screen keys', () => {
        it('should have title and navigation', () => {
            expect(en.modal.title).toBeDefined();
            expect(en.modal.goHome).toBeDefined();
        });
    });

    describe('error boundary keys', () => {
        it('should have error display strings', () => {
            expect(en.errors.boundaryTitle).toBeDefined();
            expect(en.errors.boundaryDefault).toBeDefined();
            expect(en.errors.boundaryRetry).toBeDefined();
        });
    });

    describe('common keys', () => {
        it('should have generic labels', () => {
            expect(en.common.error).toBeDefined();
            expect(en.common.success).toBeDefined();
            expect(en.common.cancel).toBeDefined();
            expect(en.common.loading).toBeDefined();
            expect(en.common.ok).toBeDefined();
        });
    });
});
