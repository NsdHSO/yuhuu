import {TokenRefreshCoordinator} from '../../token/coordinator';

describe('TokenRefreshCoordinator', () => {
    let coordinator: TokenRefreshCoordinator;

    beforeEach(() => {
        coordinator = new TokenRefreshCoordinator();
    });

    it('executes the refresh function', async () => {
        const refreshFn = jest.fn().mockResolvedValue('new-token');
        const result = await coordinator.execute(refreshFn);
        expect(result).toBe('new-token');
        expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent calls', async () => {
        let resolveRefresh: (value: string) => void;
        const refreshPromise = new Promise<string>((resolve) => {
            resolveRefresh = resolve;
        });
        const refreshFn = jest.fn().mockReturnValue(refreshPromise);

        // Start two concurrent refreshes
        const promise1 = coordinator.execute(refreshFn);
        const promise2 = coordinator.execute(refreshFn);

        // Only one call should have been made
        expect(refreshFn).toHaveBeenCalledTimes(1);

        // Resolve the refresh
        resolveRefresh!('new-token');

        // Both promises should resolve with the same value
        const result1 = await promise1;
        const result2 = await promise2;
        expect(result1).toBe('new-token');
        expect(result2).toBe('new-token');
    });

    it('resets after completion allowing new calls', async () => {
        const refreshFn = jest.fn()
            .mockResolvedValueOnce('token-1')
            .mockResolvedValueOnce('token-2');

        const result1 = await coordinator.execute(refreshFn);
        expect(result1).toBe('token-1');

        const result2 = await coordinator.execute(refreshFn);
        expect(result2).toBe('token-2');
        expect(refreshFn).toHaveBeenCalledTimes(2);
    });

    it('resets after failure allowing retry', async () => {
        const error = new Error('Refresh failed');
        const refreshFn = jest.fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce('token-after-retry');

        await expect(coordinator.execute(refreshFn)).rejects.toThrow('Refresh failed');

        const result = await coordinator.execute(refreshFn);
        expect(result).toBe('token-after-retry');
    });

    describe('isRefreshing', () => {
        it('returns false when idle', () => {
            expect(coordinator.isRefreshing()).toBe(false);
        });

        it('returns true during refresh', async () => {
            let resolveRefresh: (value: string) => void;
            const refreshPromise = new Promise<string>((resolve) => {
                resolveRefresh = resolve;
            });
            const refreshFn = jest.fn().mockReturnValue(refreshPromise);

            const executePromise = coordinator.execute(refreshFn);
            expect(coordinator.isRefreshing()).toBe(true);

            resolveRefresh!('token');
            await executePromise;
            expect(coordinator.isRefreshing()).toBe(false);
        });
    });
});
