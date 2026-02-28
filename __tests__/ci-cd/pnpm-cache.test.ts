import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

const ACTION_PATH = resolve(__dirname, '../../.github/actions/setup-node/action.yml');

interface ActionStep {
    name?: string;
    uses?: string;
    with?: Record<string, unknown>;
    run?: string;
    shell?: string;
    if?: string;
    id?: string;
    [key: string]: unknown;
}

interface CompositeAction {
    name: string;
    description: string;
    inputs?: Record<string, { description: string; required?: boolean; default?: string }>;
    runs: {
        using: string;
        steps: ActionStep[];
    };
}

function loadAction(): CompositeAction {
    const content = readFileSync(ACTION_PATH, 'utf-8');
    return yaml.load(content) as CompositeAction;
}

function findStep(steps: ActionStep[], nameSubstring: string): ActionStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findStepByUses(steps: ActionStep[], usesPrefix: string): ActionStep | undefined {
    return steps.find((step) => step.uses?.startsWith(usesPrefix));
}

function findCacheStep(steps: ActionStep[], pathContains: string): ActionStep | undefined {
    return steps.find(
        (step) =>
            step.uses?.startsWith('actions/cache') &&
            String(step.with?.path || '').includes(pathContains)
    );
}

describe('Setup Node Action - pnpm Cache Optimization', () => {
    let action: CompositeAction;
    let steps: ActionStep[];

    beforeAll(() => {
        action = loadAction();
        steps = action.runs.steps;
    });

    it('should be a valid composite action', () => {
        expect(action).toBeDefined();
        expect(action.runs).toBeDefined();
        expect(action.runs.using).toBe('composite');
        expect(action.runs.steps).toBeDefined();
        expect(action.runs.steps.length).toBeGreaterThan(0);
    });

    describe('pnpm store cache', () => {
        it('should have a cache step for pnpm store', () => {
            const cacheStep = steps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('STORE_PATH')
            );
            expect(cacheStep).toBeDefined();
        });

        it('should use pnpm-lock.yaml hash in cache key', () => {
            const cacheStep = steps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('STORE_PATH')
            );
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('pnpm-lock.yaml');
        });

        it('should have restore-keys for fallback cache matching', () => {
            const cacheStep = steps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('STORE_PATH')
            );
            expect(cacheStep).toBeDefined();

            const restoreKeys = cacheStep!.with?.['restore-keys'];
            expect(restoreKeys).toBeDefined();
            expect(String(restoreKeys)).toContain('pnpm-store');
        });
    });

    describe('node_modules cache layer', () => {
        it('should have a separate cache step for node_modules', () => {
            const nodeModulesCache = findCacheStep(steps, 'node_modules');
            expect(nodeModulesCache).toBeDefined();
        });

        it('should cache node_modules directory path', () => {
            const nodeModulesCache = findCacheStep(steps, 'node_modules');
            expect(nodeModulesCache).toBeDefined();

            const cachePath = String(nodeModulesCache!.with?.path || '');
            expect(cachePath).toContain('node_modules');
        });

        it('should use pnpm-lock.yaml hash in node_modules cache key', () => {
            const nodeModulesCache = findCacheStep(steps, 'node_modules');
            expect(nodeModulesCache).toBeDefined();

            const key = String(nodeModulesCache!.with?.key || '');
            expect(key).toContain('pnpm-lock.yaml');
        });

        it('should have restore-keys for node_modules fallback', () => {
            const nodeModulesCache = findCacheStep(steps, 'node_modules');
            expect(nodeModulesCache).toBeDefined();

            const restoreKeys = nodeModulesCache!.with?.['restore-keys'];
            expect(restoreKeys).toBeDefined();
        });
    });

    describe('pnpm fetch optimization', () => {
        it('should have a pnpm fetch step', () => {
            const fetchStep = steps.find(
                (step) => step.run && step.run.includes('pnpm fetch')
            );
            expect(fetchStep).toBeDefined();
        });

        it('should run pnpm fetch before pnpm install', () => {
            const fetchIndex = steps.findIndex(
                (step) => step.run && step.run.includes('pnpm fetch')
            );
            const installIndex = steps.findIndex(
                (step) => step.run && step.run.includes('pnpm install')
            );

            expect(fetchIndex).toBeGreaterThanOrEqual(0);
            expect(installIndex).toBeGreaterThanOrEqual(0);
            expect(fetchIndex).toBeLessThan(installIndex);
        });
    });

    describe('install flags optimization', () => {
        it('should use --frozen-lockfile flag in install command', () => {
            const installStep = steps.find(
                (step) => step.run && step.run.includes('pnpm install')
            );
            expect(installStep).toBeDefined();
            expect(installStep!.run).toContain('--frozen-lockfile');
        });

        it('should use --offline flag in install command for cache hits', () => {
            const installStep = steps.find(
                (step) => step.run && step.run.includes('pnpm install')
            );
            expect(installStep).toBeDefined();
            expect(installStep!.run).toContain('--offline');
        });
    });

    describe('step ordering', () => {
        it('should setup pnpm before getting store path', () => {
            const pnpmSetupIndex = steps.findIndex(
                (step) => step.uses?.includes('pnpm/action-setup')
            );
            const storePathIndex = steps.findIndex(
                (step) => step.run && step.run.includes('pnpm store path')
            );

            expect(pnpmSetupIndex).toBeGreaterThanOrEqual(0);
            expect(storePathIndex).toBeGreaterThanOrEqual(0);
            expect(pnpmSetupIndex).toBeLessThan(storePathIndex);
        });

        it('should setup store cache before pnpm fetch', () => {
            const storeCacheIndex = steps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('STORE_PATH')
            );
            const fetchIndex = steps.findIndex(
                (step) => step.run && step.run.includes('pnpm fetch')
            );

            expect(storeCacheIndex).toBeGreaterThanOrEqual(0);
            expect(fetchIndex).toBeGreaterThanOrEqual(0);
            expect(storeCacheIndex).toBeLessThan(fetchIndex);
        });

        it('should place node_modules cache before install', () => {
            const nodeModulesCacheIndex = steps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('node_modules')
            );
            const installIndex = steps.findIndex(
                (step) => step.run && step.run.includes('pnpm install')
            );

            expect(nodeModulesCacheIndex).toBeGreaterThanOrEqual(0);
            expect(installIndex).toBeGreaterThanOrEqual(0);
            expect(nodeModulesCacheIndex).toBeLessThan(installIndex);
        });
    });

    describe('cache key structure', () => {
        it('should include runner.os in pnpm store cache key', () => {
            const cacheStep = steps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('STORE_PATH')
            );
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('runner.os');
        });

        it('should include runner.os in node_modules cache key', () => {
            const nodeModulesCache = findCacheStep(steps, 'node_modules');
            expect(nodeModulesCache).toBeDefined();

            const key = String(nodeModulesCache!.with?.key || '');
            expect(key).toContain('runner.os');
        });

        it('should use hashFiles for pnpm-lock.yaml in cache keys', () => {
            const cacheSteps = steps.filter(
                (step) => step.uses?.startsWith('actions/cache')
            );

            for (const cacheStep of cacheSteps) {
                const key = String(cacheStep.with?.key || '');
                if (key.includes('pnpm')) {
                    expect(key).toContain('hashFiles');
                    expect(key).toContain('pnpm-lock.yaml');
                }
            }
        });
    });

    describe('workflows using setup-node action', () => {
        it('should be used in test workflow', () => {
            const testWorkflowPath = resolve(__dirname, '../../.github/workflows/test.yml');
            const content = readFileSync(testWorkflowPath, 'utf-8');
            const testWorkflow = yaml.load(content) as Record<string, unknown>;

            expect(testWorkflow).toBeDefined();
            // Verify setup-node action is referenced
            expect(content).toContain('./.github/actions/setup-node');
        });

        it('should be used in build-android workflow', () => {
            const androidWorkflowPath = resolve(
                __dirname,
                '../../.github/workflows/build-android.yml'
            );
            const content = readFileSync(androidWorkflowPath, 'utf-8');
            expect(content).toContain('./.github/actions/setup-node');
        });

        it('should be used in build-ios workflow', () => {
            const iosWorkflowPath = resolve(
                __dirname,
                '../../.github/workflows/build-ios.yml'
            );
            const content = readFileSync(iosWorkflowPath, 'utf-8');
            expect(content).toContain('./.github/actions/setup-node');
        });
    });

    describe('cache miss fallback', () => {
        it('should still run install even without cache hit', () => {
            // The install step should not be conditional on cache hit
            const installStep = steps.find(
                (step) => step.run && step.run.includes('pnpm install')
            );
            expect(installStep).toBeDefined();

            // Install should only be conditional on install-deps input, not cache
            if (installStep!.if) {
                const condition = String(installStep!.if);
                expect(condition).not.toContain('cache-hit');
            }
        });

        it('should have pnpm fetch that works regardless of cache state', () => {
            const fetchStep = steps.find(
                (step) => step.run && step.run.includes('pnpm fetch')
            );
            expect(fetchStep).toBeDefined();

            // fetch should not be conditional on cache hit
            if (fetchStep!.if) {
                const condition = String(fetchStep!.if);
                expect(condition).not.toContain('cache-hit');
            }
        });
    });
});
