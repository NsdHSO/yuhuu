/**
 * Token refresh coordinator with request deduplication.
 *
 * SOLID: Single Responsibility - request deduplication only.
 */

export class TokenRefreshCoordinator {
    private inflightRefresh: Promise<string | null> | null = null;

    /**
     * Executes refresh with deduplication.
     * Multiple concurrent calls return the same promise.
     */
    async execute(refreshFn: () => Promise<string | null>): Promise<string | null> {
        if (!this.inflightRefresh) {
            this.inflightRefresh = (async () => {
                try {
                    return await refreshFn();
                } finally {
                    this.inflightRefresh = null;
                }
            })();
        }
        return this.inflightRefresh;
    }

    isRefreshing(): boolean {
        return this.inflightRefresh !== null;
    }
}
