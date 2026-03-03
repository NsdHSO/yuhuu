/**
 * Polyfills for browser APIs that may not be available in all environments
 */

// Polyfill for requestIdleCallback
// This is used by libraries like urql and react-query
if (typeof requestIdleCallback === 'undefined') {
    (global as any).requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
        const start = Date.now();
        const timeout = setTimeout(() => {
            callback({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
            });
        }, 1);
        return timeout as any as number;
    };
}

if (typeof cancelIdleCallback === 'undefined') {
    (global as any).cancelIdleCallback = (id: number) => {
        clearTimeout(id);
    };
}

export {};
