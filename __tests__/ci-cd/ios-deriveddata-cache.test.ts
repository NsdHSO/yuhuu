/**
 * Tests for iOS DerivedData caching in the build-ios.yml workflow
 *
 * PROBLEM: Xcode rebuilds the entire project from scratch on every CI run.
 * DerivedData contains compiled object files, Swift module caches, and
 * intermediate build products that can be reused across builds.
 *
 * SOLUTION: Cache the ios/build directory (DerivedData path set via
 * -derivedDataPath build) using actions/cache@v4 with a cache key that
 * hashes Swift files, Objective-C files, and Podfile.lock.
 *
 * Expected savings: 6-10 minutes on cache hit (incremental vs full compile).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

const WORKSPACE_ROOT = resolve(__dirname, '../..');
const WORKFLOW_PATH = resolve(WORKSPACE_ROOT, '.github/workflows/build-ios.yml');

interface WorkflowStep {
    name?: string;
    uses?: string;
    id?: string;
    if?: string;
    with?: Record<string, unknown>;
    run?: string;
    env?: Record<string, string>;
    [key: string]: unknown;
}

interface WorkflowJob {
    steps: WorkflowStep[];
    [key: string]: unknown;
}

interface Workflow {
    jobs: Record<string, WorkflowJob>;
    [key: string]: unknown;
}

function loadWorkflow(): Workflow {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    return yaml.load(content) as Workflow;
}

function loadWorkflowRaw(): string {
    return readFileSync(WORKFLOW_PATH, 'utf-8');
}

function findStepByName(steps: WorkflowStep[], nameSubstring: string): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findCacheStepByPath(steps: WorkflowStep[], pathContains: string): WorkflowStep | undefined {
    return steps.find(
        (step) =>
            step.uses?.startsWith('actions/cache') &&
            String(step.with?.path || '').includes(pathContains)
    );
}

describe('iOS Build Workflow - DerivedData Cache', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        buildSteps = workflow.jobs.build.steps;
    });

    it('should have a valid workflow file', () => {
        expect(workflow).toBeDefined();
        expect(workflow.jobs.build).toBeDefined();
        expect(buildSteps.length).toBeGreaterThan(0);
    });

    describe('Unit: DerivedData cache step existence', () => {
        it('should have a cache step named DerivedData', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            expect(derivedDataCache!.uses).toMatch(/^actions\/cache@v\d+/);
        });

        it('should use actions/cache@v4 or later', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const match = derivedDataCache!.uses?.match(/actions\/cache@v(\d+)/);
            expect(match).not.toBeNull();
            expect(parseInt(match![1], 10)).toBeGreaterThanOrEqual(4);
        });
    });

    describe('Unit: Cache path configuration', () => {
        it('should cache the ios/build directory', () => {
            const derivedDataCache = findCacheStepByPath(buildSteps, 'ios/build');
            expect(derivedDataCache).toBeDefined();
        });

        it('should cache path matching the xcodebuild -derivedDataPath', () => {
            // The build step uses: -derivedDataPath build (within ios/ working directory)
            // So the full path from repo root is ios/build
            const buildStep = findStepByName(buildSteps, 'build ios release');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).toContain('-derivedDataPath build');

            const derivedDataCache = findCacheStepByPath(buildSteps, 'ios/build');
            expect(derivedDataCache).toBeDefined();
            const cachePath = String(derivedDataCache!.with?.path || '');
            expect(cachePath).toBe('ios/build');
        });

        it('should NOT cache the entire ios/ directory (that is prebuild cache)', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cachePath = String(derivedDataCache!.with?.path || '');
            // Should be ios/build specifically, not just ios/
            expect(cachePath).not.toBe('ios/');
            expect(cachePath).not.toBe('ios');
        });
    });

    describe('Unit: Cache key generation', () => {
        it('should include runner.os in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('runner.os');
        });

        it('should include deriveddata identifier in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey.toLowerCase()).toContain('deriveddata');
        });

        it('should hash Swift source files (*.swift) in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('*.swift');
        });

        it('should hash Objective-C source files (*.m) in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('*.m');
        });

        it('should hash Objective-C++ source files (*.mm) in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('*.mm');
        });

        it('should hash Podfile.lock in cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('Podfile.lock');
        });

        it('should use hashFiles function for cache key', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            expect(cacheKey).toContain('hashFiles');
        });

        it('should scope file hashes to ios/ directory', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');
            // The hashFiles patterns should be scoped to ios/ directory
            expect(cacheKey).toContain('ios/');
        });
    });

    describe('Unit: Restore keys configuration', () => {
        it('should have restore-keys for fallback cache matching', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const restoreKeys = derivedDataCache!.with?.['restore-keys'];
            expect(restoreKeys).toBeDefined();
        });

        it('should have a restore key with runner.os and deriveddata prefix', () => {
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const restoreKeys = String(derivedDataCache!.with?.['restore-keys'] || '');
            expect(restoreKeys).toContain('runner.os');
            expect(restoreKeys.toLowerCase()).toContain('deriveddata');
        });
    });

    describe('Integration: Step ordering in workflow', () => {
        it('should place DerivedData cache after CocoaPods cache', () => {
            const podsIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('cache cocoapods')
            );
            const derivedDataIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('deriveddata')
            );

            expect(podsIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThan(podsIndex);
        });

        it('should place DerivedData cache before the Build iOS Release step', () => {
            const derivedDataIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('deriveddata')
            );
            const buildIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('build ios release')
            );

            expect(derivedDataIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeLessThan(buildIndex);
        });

        it('should place DerivedData cache after prebuild step', () => {
            const prebuildIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('prebuild ios')
            );
            const derivedDataIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('deriveddata')
            );

            expect(prebuildIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThan(prebuildIndex);
        });

        it('should place DerivedData cache after pod install step', () => {
            const podInstallIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('install ios dependencies')
            );
            const derivedDataIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('deriveddata')
            );

            expect(podInstallIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThanOrEqual(0);
            expect(derivedDataIndex).toBeGreaterThan(podInstallIndex);
        });
    });

    describe('Integration: Cache does not conflict with existing caches', () => {
        it('should have a different cache key pattern than prebuild cache', () => {
            const prebuildCache = findStepByName(buildSteps, 'cache ios prebuild');
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');

            expect(prebuildCache).toBeDefined();
            expect(derivedDataCache).toBeDefined();

            const prebuildKey = String(prebuildCache!.with?.key || '');
            const derivedDataKey = String(derivedDataCache!.with?.key || '');

            // They should not share the same key pattern
            expect(derivedDataKey).not.toEqual(prebuildKey);
        });

        it('should have a different cache path than CocoaPods cache', () => {
            const podsCache = findStepByName(buildSteps, 'cache cocoapods');
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');

            expect(podsCache).toBeDefined();
            expect(derivedDataCache).toBeDefined();

            const podsCachePath = String(podsCache!.with?.path || '');
            const derivedDataCachePath = String(derivedDataCache!.with?.path || '');

            expect(derivedDataCachePath).not.toEqual(podsCachePath);
        });
    });

    describe('E2E: Build time improvement potential', () => {
        it('should have xcodebuild using -derivedDataPath that matches cache path', () => {
            // The xcodebuild command uses -derivedDataPath build (relative to ios/)
            // The cache should cache ios/build to persist this across runs
            const buildStep = findStepByName(buildSteps, 'build ios release');
            expect(buildStep).toBeDefined();

            const derivedDataPathMatch = buildStep!.run?.match(/-derivedDataPath\s+(\S+)/);
            expect(derivedDataPathMatch).not.toBeNull();
            const derivedDataDir = derivedDataPathMatch![1]; // "build"

            // The working directory for the build step is ios/
            const workingDir = buildStep!['working-directory'];
            expect(workingDir).toBe('ios');

            // So the full DerivedData path from repo root is ios/build
            const fullDerivedDataPath = `${workingDir}/${derivedDataDir}`;

            // This should match what the cache step caches
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cachePath = String(derivedDataCache!.with?.path || '');
            expect(cachePath).toBe(fullDerivedDataPath);
        });

        it('should cache compiled artifacts that enable incremental builds', () => {
            // DerivedData contains:
            // - Build/Intermediates.noindex/ (object files, Swift module caches)
            // - Build/Products/ (final build products)
            // - ModuleCache.noindex/ (Clang module caches)
            //
            // Caching ios/build captures all of these, enabling Xcode to
            // skip recompilation of unchanged source files.
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();

            // The cache path should include the build directory that xcodebuild writes to
            const cachePath = String(derivedDataCache!.with?.path || '');
            expect(cachePath).toContain('build');
        });

        it('should invalidate cache when source files change', () => {
            // The cache key includes hashes of Swift and ObjC files
            // When source files change, the hash changes, and a new cache is created
            // This ensures stale object files don't cause build issues
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const cacheKey = String(derivedDataCache!.with?.key || '');

            // Should hash source files for proper invalidation
            expect(cacheKey).toContain('hashFiles');
            expect(cacheKey).toContain('*.swift');
            expect(cacheKey).toContain('*.m');
        });

        it('should fall back to partial cache when source changes but deps unchanged', () => {
            // When only Swift/ObjC files change but Podfile.lock is the same,
            // the restore-key should still find a usable partial cache
            // This gives Xcode a head start with compiled Pod modules
            const derivedDataCache = findStepByName(buildSteps, 'deriveddata');
            expect(derivedDataCache).toBeDefined();
            const restoreKeys = String(derivedDataCache!.with?.['restore-keys'] || '');

            // Restore key should be a prefix that matches even when source hash changes
            expect(restoreKeys.trim().length).toBeGreaterThan(0);
        });
    });
});
