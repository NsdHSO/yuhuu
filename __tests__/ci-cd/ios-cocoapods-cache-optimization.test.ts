/**
 * Tests for CocoaPods cache optimization in the iOS build workflow
 *
 * PROBLEM: Current workflow only caches ios/Pods directory.
 * This misses CocoaPods' global caches which store downloaded specs
 * and prebuilt pod binaries.
 *
 * ISSUES with current approach:
 * 1. Only caches ios/Pods (the project-level installed pods)
 * 2. Misses ~/Library/Caches/CocoaPods (downloaded pod specs/archives)
 * 3. Misses ~/.cocoapods (CocoaPods repo index and metadata)
 * 4. Cache key only hashes Podfile.lock, not Podfile itself
 *
 * SOLUTION: Expand cache paths to include CocoaPods global caches
 * and hash both Podfile.lock and Podfile for proper invalidation.
 *
 * Expected savings: 2-3 minutes per build from avoiding redundant downloads
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

const WORKFLOW_PATH = resolve(__dirname, '../../.github/workflows/build-ios.yml');

interface WorkflowStep {
    name?: string;
    uses?: string;
    with?: Record<string, unknown>;
    run?: string;
    id?: string;
    if?: string;
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

function findCocoapodsCacheStep(steps: WorkflowStep[]): WorkflowStep | undefined {
    return steps.find(
        (step) =>
            step.uses?.startsWith('actions/cache') &&
            step.name?.toLowerCase().includes('cocoapods')
    );
}

describe('iOS Build Workflow - CocoaPods Cache Optimization', () => {
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

    describe('CocoaPods cache step existence', () => {
        it('should have a cache step named for CocoaPods', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();
        });

        it('should use actions/cache@v4 for CocoaPods caching', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();
            expect(cacheStep!.uses).toMatch(/^actions\/cache@v4/);
        });
    });

    describe('Cache paths - project-level pods', () => {
        it('should cache ios/Pods directory', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const cachePath = String(cacheStep!.with?.path || '');
            expect(cachePath).toContain('ios/Pods');
        });
    });

    describe('Cache paths - global CocoaPods caches', () => {
        it('should cache ~/Library/Caches/CocoaPods for downloaded specs and archives', () => {
            // ~/Library/Caches/CocoaPods stores downloaded pod source archives
            // Without caching this, every CI run re-downloads all pod sources
            // This is often the slowest part of `pod install`
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const cachePath = String(cacheStep!.with?.path || '');
            expect(cachePath).toContain('~/Library/Caches/CocoaPods');
        });

        it('should cache ~/.cocoapods for repo index and metadata', () => {
            // ~/.cocoapods stores the CocoaPods spec repo (master specs)
            // and metadata about installed pods
            // Without caching, `pod install` must clone/update the spec repo
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const cachePath = String(cacheStep!.with?.path || '');
            expect(cachePath).toContain('~/.cocoapods');
        });

        it('should have all three cache paths present', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const cachePath = String(cacheStep!.with?.path || '');
            const expectedPaths = [
                'ios/Pods',
                '~/Library/Caches/CocoaPods',
                '~/.cocoapods',
            ];

            for (const expectedPath of expectedPaths) {
                expect(cachePath).toContain(expectedPath);
            }
        });
    });

    describe('Cache key strategy', () => {
        it('should include runner.os in cache key', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('runner.os');
        });

        it('should hash Podfile.lock in cache key', () => {
            // Podfile.lock is the primary dependency lock file
            // Changes to it mean pod versions changed
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('Podfile.lock');
        });

        it('should hash Podfile in cache key for configuration changes', () => {
            // The Podfile itself may change (new pods added, platform version changed)
            // even before Podfile.lock is updated
            // Hashing both ensures cache invalidation on any dependency config change
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('Podfile');
            // Verify both are referenced (Podfile AND Podfile.lock)
            expect(key).toMatch(/Podfile\.lock/);
            expect(key).toMatch(/Podfile[^.]/);
        });

        it('should use hashFiles function for cache key generation', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('hashFiles');
        });

        it('should have both Podfile and Podfile.lock in the same hashFiles call', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const key = String(cacheStep!.with?.key || '');
            // The hashFiles call should contain both files for a combined hash
            const hashFilesMatch = key.match(/hashFiles\(([^)]+)\)/);
            expect(hashFilesMatch).not.toBeNull();
            if (hashFilesMatch) {
                const args = hashFilesMatch[1];
                expect(args).toContain('Podfile.lock');
                expect(args).toContain('Podfile');
            }
        });
    });

    describe('Cache restore keys', () => {
        it('should have restore-keys for fallback cache matching', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const restoreKeys = cacheStep!.with?.['restore-keys'];
            expect(restoreKeys).toBeDefined();
        });

        it('should have restore-keys with runner.os prefix for pod caching', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            const restoreKeys = String(cacheStep!.with?.['restore-keys'] || '');
            expect(restoreKeys).toContain('pods');
        });
    });

    describe('Step ordering', () => {
        it('should place CocoaPods cache step before pod install', () => {
            const cacheIndex = buildSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    step.name?.toLowerCase().includes('cocoapods')
            );

            const podInstallIndex = buildSteps.findIndex(
                (step) => step.run && step.run.includes('pod install')
            );

            expect(cacheIndex).toBeGreaterThanOrEqual(0);
            expect(podInstallIndex).toBeGreaterThanOrEqual(0);
            expect(cacheIndex).toBeLessThan(podInstallIndex);
        });

        it('should place CocoaPods cache step after CocoaPods installation', () => {
            const gemInstallIndex = buildSteps.findIndex(
                (step) => step.run && step.run.includes('gem install cocoapods')
            );

            const cacheIndex = buildSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    step.name?.toLowerCase().includes('cocoapods')
            );

            expect(gemInstallIndex).toBeGreaterThanOrEqual(0);
            expect(cacheIndex).toBeGreaterThanOrEqual(0);
            expect(gemInstallIndex).toBeLessThan(cacheIndex);
        });
    });

    describe('Integration: cache with pod install', () => {
        it('should have pod install step in the workflow', () => {
            const podInstallStep = buildSteps.find(
                (step) => step.run && step.run.includes('pod install')
            );
            expect(podInstallStep).toBeDefined();
        });

        it('should run pod install unconditionally (not skip on cache hit)', () => {
            // pod install should always run because:
            // 1. Cache may be partial (only some pods cached)
            // 2. Podfile may have changed since last cache
            // 3. pod install is idempotent and fast with cached data
            const podInstallStep = buildSteps.find(
                (step) => step.run && step.run.includes('pod install')
            );
            expect(podInstallStep).toBeDefined();

            // Should not be conditional on cache-hit
            if (podInstallStep!.if) {
                expect(String(podInstallStep!.if)).not.toContain('cache-hit');
            }
        });

        it('should have working-directory set to ios for pod install', () => {
            const podInstallStep = buildSteps.find(
                (step) => step.run && step.run.includes('pod install')
            );
            expect(podInstallStep).toBeDefined();

            const workDir = podInstallStep!['working-directory'];
            expect(workDir).toBe('ios');
        });
    });

    describe('E2E: complete CocoaPods cache configuration', () => {
        it('should have a complete and correct CocoaPods cache configuration', () => {
            const cacheStep = findCocoapodsCacheStep(buildSteps);
            expect(cacheStep).toBeDefined();

            // Verify the complete cache configuration
            const cachePath = String(cacheStep!.with?.path || '');
            const cacheKey = String(cacheStep!.with?.key || '');
            const restoreKeys = String(cacheStep!.with?.['restore-keys'] || '');

            // All three paths must be present
            expect(cachePath).toContain('ios/Pods');
            expect(cachePath).toContain('~/Library/Caches/CocoaPods');
            expect(cachePath).toContain('~/.cocoapods');

            // Key must include OS and both Podfile hashes
            expect(cacheKey).toContain('runner.os');
            expect(cacheKey).toContain('Podfile.lock');
            expect(cacheKey).toContain('hashFiles');

            // Restore keys must be present for fallback
            expect(restoreKeys.length).toBeGreaterThan(0);
        });

        it('should properly interact with the prebuild cache', () => {
            // The CocoaPods cache should be separate from the prebuild cache
            // because they have different invalidation criteria
            const cocoapodsCache = findCocoapodsCacheStep(buildSteps);
            const prebuildCache = buildSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    step.name?.toLowerCase().includes('prebuild')
            );

            expect(cocoapodsCache).toBeDefined();
            expect(prebuildCache).toBeDefined();

            // They should be different steps
            expect(cocoapodsCache).not.toBe(prebuildCache);

            // Their cache keys should be different
            const cocoapodsKey = String(cocoapodsCache!.with?.key || '');
            const prebuildKey = String(prebuildCache!.with?.key || '');
            expect(cocoapodsKey).not.toBe(prebuildKey);
        });
    });
});
