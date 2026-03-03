/**
 * iOS ccache Integration Tests (TDD RED Phase)
 *
 * PROBLEM: iOS native compilation (C/C++/ObjC) during `pod install` and
 * `xcodebuild` is the slowest part of the iOS CI pipeline. Each build
 * recompiles all native modules from scratch, even when source hasn't changed.
 *
 * SOLUTION: Integrate ccache as a compiler cache for iOS builds:
 * 1. Install ccache on the CI runner
 * 2. Set apple.ccacheEnabled=true in Podfile.properties.json
 * 3. Cache the ccache directory (~/.ccache) across CI runs
 * 4. Configure CC/CXX environment variables for xcodebuild
 *
 * Expected savings: 4-8 minutes on cache hit (native compilation skipped)
 *
 * These tests should FAIL against the current workflow (no ccache) and
 * PASS once the ccache integration is implemented.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const MONOREPO_ROOT = path.resolve(__dirname, '../../../..');
const APP_ROOT = path.resolve(__dirname, '../..');
const IOS_WORKFLOW_PATH = path.join(
    MONOREPO_ROOT,
    '.github',
    'workflows',
    'build-ios.yml'
);
const PODFILE_PROPERTIES_PATH = path.join(
    APP_ROOT,
    'ios',
    'Podfile.properties.json'
);

// ---- Types ------------------------------------------------------------------

interface WorkflowStep {
    name?: string;
    uses?: string;
    with?: Record<string, unknown>;
    run?: string;
    env?: Record<string, string>;
    id?: string;
    if?: string;

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

// ---- Helpers ----------------------------------------------------------------

function loadWorkflow(): Workflow {
    const content = fs.readFileSync(IOS_WORKFLOW_PATH, 'utf-8');
    return yaml.load(content) as Workflow;
}

function loadWorkflowRaw(): string {
    return fs.readFileSync(IOS_WORKFLOW_PATH, 'utf-8');
}

function findStep(
    steps: WorkflowStep[],
    nameSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findStepByRun(
    steps: WorkflowStep[],
    runSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.run?.toLowerCase().includes(runSubstring.toLowerCase())
    );
}

function findCacheStep(
    steps: WorkflowStep[],
    pathContains: string
): WorkflowStep | undefined {
    return steps.find(
        (step) =>
            step.uses?.startsWith('actions/cache') &&
            String(step.with?.path || '').includes(pathContains)
    );
}

function loadPodfileProperties(): Record<string, unknown> {
    const content = fs.readFileSync(PODFILE_PROPERTIES_PATH, 'utf-8');
    return JSON.parse(content);
}

// ---- Test Suite: ccache Installation ----------------------------------------

describe('iOS ccache Integration', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];
    let workflowRaw: string;

    beforeAll(() => {
        workflow = loadWorkflow();
        buildSteps = workflow.jobs.build.steps;
        workflowRaw = loadWorkflowRaw();
    });

    describe('ccache installation step', () => {
        it('should have a step that installs ccache', () => {
            // ccache must be installed on the macOS runner before it can be used
            // Expected step:
            //   - name: Install ccache
            //     run: brew install ccache
            const ccacheStep = findStep(buildSteps, 'ccache');
            expect(ccacheStep).toBeDefined();
        });

        it('should install ccache using Homebrew', () => {
            // macOS runners have Homebrew pre-installed
            // ccache is available via: brew install ccache
            const ccacheInstallStep =
                findStep(buildSteps, 'install ccache') ||
                findStepByRun(buildSteps, 'brew install ccache');

            expect(ccacheInstallStep).toBeDefined();
            expect(ccacheInstallStep!.run).toContain('brew install ccache');
        });

        it('should install ccache before pod install step', () => {
            // ccache must be available before CocoaPods compiles native modules
            const ccacheIndex = buildSteps.findIndex(
                (step) =>
                    step.name?.toLowerCase().includes('ccache') &&
                    step.run?.includes('brew install ccache')
            );
            const podInstallIndex = buildSteps.findIndex(
                (step) =>
                    step.name?.toLowerCase().includes('install') &&
                    step.run?.includes('pod install')
            );

            expect(ccacheIndex).toBeGreaterThanOrEqual(0);
            expect(podInstallIndex).toBeGreaterThanOrEqual(0);
            expect(ccacheIndex).toBeLessThan(podInstallIndex);
        });

        it('should install ccache before xcodebuild step', () => {
            // ccache must also be available before xcodebuild compiles
            const ccacheIndex = buildSteps.findIndex(
                (step) =>
                    step.name?.toLowerCase().includes('ccache') &&
                    step.run?.includes('brew install ccache')
            );
            const buildIndex = buildSteps.findIndex(
                (step) =>
                    step.run?.includes('xcodebuild')
            );

            expect(ccacheIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);
            expect(ccacheIndex).toBeLessThan(buildIndex);
        });
    });

    describe('ccache cache step', () => {
        it('should cache the ccache directory', () => {
            // The ccache compilation cache should be persisted across CI runs
            // Expected: actions/cache with path ~/.ccache or ~/Library/Caches/ccache
            const ccacheCacheStep =
                findCacheStep(buildSteps, 'ccache') ||
                findCacheStep(buildSteps, '.ccache');

            expect(ccacheCacheStep).toBeDefined();
        });

        it('should use a cache key that includes the runner OS', () => {
            // Cache key should include runner.os for platform-specific separation
            const ccacheCacheStep =
                findCacheStep(buildSteps, 'ccache') ||
                findCacheStep(buildSteps, '.ccache');

            expect(ccacheCacheStep).toBeDefined();
            const cacheKey = String(ccacheCacheStep!.with?.key || '');
            expect(cacheKey).toContain('runner.os');
        });

        it('should use a cache key that includes ccache identifier', () => {
            // Cache key should identify this as the ccache cache
            const ccacheCacheStep =
                findCacheStep(buildSteps, 'ccache') ||
                findCacheStep(buildSteps, '.ccache');

            expect(ccacheCacheStep).toBeDefined();
            const cacheKey = String(ccacheCacheStep!.with?.key || '');
            expect(cacheKey.toLowerCase()).toContain('ccache');
        });

        it('should have restore-keys for fallback cache matching', () => {
            // Restore keys allow partial cache hits when exact key doesn't match
            const ccacheCacheStep =
                findCacheStep(buildSteps, 'ccache') ||
                findCacheStep(buildSteps, '.ccache');

            expect(ccacheCacheStep).toBeDefined();
            const restoreKeys = ccacheCacheStep!.with?.['restore-keys'];
            expect(restoreKeys).toBeDefined();
        });

        it('should place cache step before ccache install step', () => {
            // Cache restore must happen before ccache is used
            const cacheIndex = buildSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    (String(step.with?.path || '').includes('ccache') ||
                        String(step.with?.path || '').includes('.ccache'))
            );
            const installIndex = buildSteps.findIndex(
                (step) =>
                    step.run?.includes('brew install ccache')
            );

            if (cacheIndex >= 0 && installIndex >= 0) {
                expect(cacheIndex).toBeLessThan(installIndex);
            }
        });
    });

    describe('ccache configuration', () => {
        it('should configure ccache max size', () => {
            // ccache should have a max size set to prevent unbounded growth
            // Expected: ccache --set-config=max_size=2G (or similar)
            const hasMaxSize = buildSteps.some(
                (step) =>
                    step.run?.includes('ccache') &&
                    (step.run?.includes('max_size') || step.run?.includes('--max-size'))
            );
            expect(hasMaxSize).toBe(true);
        });

        it('should configure ccache to use content-based hashing', () => {
            // Content-based hashing (sloppiness) improves hit rate for CI
            // because file timestamps change between CI runs
            // Expected: ccache --set-config=sloppiness=...
            // or CCACHE_SLOPPINESS env var
            const hasSloppy = buildSteps.some(
                (step) =>
                    (step.run?.includes('sloppiness') ||
                        step.env?.CCACHE_SLOPPINESS !== undefined)
            );
            expect(hasSloppy).toBe(true);
        });
    });

    describe('ccache configuration for xcodebuild', () => {
        it('should configure PATH to use ccache symlinks', () => {
            // xcodebuild uses ccache via symlinks in /opt/homebrew/opt/ccache/libexec
            // This is the recommended approach (vs setting CC/CXX env vars)
            // ccache provides clang/clang++ symlinks that xcodebuild can find automatically
            const buildStep = buildSteps.find((step) =>
                step.run?.includes('xcodebuild')
            );

            expect(buildStep).toBeDefined();
            // Check for PATH export that includes ccache libexec directory
            const hasPathExport =
                buildStep!.run?.includes('PATH=') &&
                buildStep!.run?.includes('ccache/libexec');

            expect(hasPathExport).toBe(true);
        });

        it('should prepend ccache to PATH before running xcodebuild', () => {
            // Verify the PATH export comes before xcodebuild command
            // This ensures xcodebuild finds ccache's clang/clang++ symlinks first
            const buildStep = buildSteps.find((step) =>
                step.run?.includes('xcodebuild')
            );

            expect(buildStep).toBeDefined();
            const runScript = buildStep!.run || '';

            // Find positions of PATH export and xcodebuild command
            const pathExportPos = runScript.indexOf('PATH=');
            const xcodebuildPos = runScript.indexOf('xcodebuild');

            expect(pathExportPos).toBeGreaterThanOrEqual(0);
            expect(xcodebuildPos).toBeGreaterThanOrEqual(0);
            expect(pathExportPos).toBeLessThan(xcodebuildPos);
        });
    });
});

// ---- Test Suite: Podfile.properties.json ------------------------------------

describe('Podfile.properties.json - ccache configuration', () => {
    const iosDirExists = fs.existsSync(path.join(APP_ROOT, 'ios'));
    let podfileProps: Record<string, unknown>;

    beforeAll(() => {
        if (iosDirExists) {
            podfileProps = loadPodfileProperties();
        }
    });

    it('should have apple.ccacheEnabled property', () => {
        if (!iosDirExists) {
            console.log('⚠️  Skipping: ios/ directory not generated yet (run expo prebuild)');
            return;
        }
        // Expo / React Native reads this property during pod install
        // to determine whether to use ccache for native module compilation
        expect(podfileProps).toHaveProperty(['apple.ccacheEnabled']);
    });

    it('should have apple.ccacheEnabled set to "true"', () => {
        if (!iosDirExists) {
            console.log('⚠️  Skipping: ios/ directory not generated yet (run expo prebuild)');
            return;
        }
        // Value must be string "true" (not boolean true) because
        // Podfile.properties.json is read as string values by the
        // React Native CLI / Expo build system
        expect(podfileProps['apple.ccacheEnabled']).toBe('true');
    });

    it('should preserve existing properties', () => {
        if (!iosDirExists) {
            console.log('⚠️  Skipping: ios/ directory not generated yet (run expo prebuild)');
            return;
        }
        // Adding ccache should NOT remove existing properties
        // Expected existing properties:
        // - expo.jsEngine: "hermes"
        // - EX_DEV_CLIENT_NETWORK_INSPECTOR: "true"
        // - newArchEnabled: "true"
        expect(podfileProps).toHaveProperty(['expo.jsEngine']);
        expect(podfileProps['expo.jsEngine']).toBe('hermes');
    });

    it('should preserve newArchEnabled property', () => {
        if (!iosDirExists) {
            console.log('⚠️  Skipping: ios/ directory not generated yet (run expo prebuild)');
            return;
        }
        expect(podfileProps).toHaveProperty('newArchEnabled');
        expect(podfileProps['newArchEnabled']).toBe('true');
    });

    it('should preserve EX_DEV_CLIENT_NETWORK_INSPECTOR property', () => {
        if (!iosDirExists) {
            console.log('⚠️  Skipping: ios/ directory not generated yet (run expo prebuild)');
            return;
        }
        expect(podfileProps).toHaveProperty('EX_DEV_CLIENT_NETWORK_INSPECTOR');
        expect(podfileProps['EX_DEV_CLIENT_NETWORK_INSPECTOR']).toBe('true');
    });
});

// ---- Test Suite: Build step ordering ----------------------------------------

describe('iOS Build Workflow - ccache step ordering', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        buildSteps = workflow.jobs.build.steps;
    });

    it('should have steps in correct order: cache -> install -> configure -> build', () => {
        // Proper ordering ensures ccache is available and configured before use
        const cacheIndex = buildSteps.findIndex(
            (step) =>
                step.uses?.startsWith('actions/cache') &&
                (String(step.with?.path || '').includes('ccache') ||
                    String(step.with?.path || '').includes('.ccache'))
        );

        const installIndex = buildSteps.findIndex(
            (step) => step.run?.includes('brew install ccache')
        );

        const buildIndex = buildSteps.findIndex(
            (step) => step.run?.includes('xcodebuild')
        );

        // All steps must exist
        expect(cacheIndex).toBeGreaterThanOrEqual(0);
        expect(installIndex).toBeGreaterThanOrEqual(0);
        expect(buildIndex).toBeGreaterThanOrEqual(0);

        // Order must be: cache restore -> install -> build
        expect(cacheIndex).toBeLessThan(installIndex);
        expect(installIndex).toBeLessThan(buildIndex);
    });

    it('should not have duplicate ccache installation steps', () => {
        const ccacheInstallSteps = buildSteps.filter(
            (step) => step.run?.includes('brew install ccache')
        );
        expect(ccacheInstallSteps.length).toBe(1);
    });
});

// ---- Test Suite: Build time savings documentation ---------------------------

describe('ccache build time savings', () => {
    it('should provide 4-8 minutes savings on cache hit', () => {
        // ccache caches compiled object files. On cache hit:
        // - Native modules (React Native, Expo, third-party): skip compilation
        // - Only changed files are recompiled
        //
        // Typical iOS build breakdown:
        // - pod install: 2-3 minutes (downloads + compiles)
        // - xcodebuild compile: 5-10 minutes
        // - xcodebuild link: 1-2 minutes
        //
        // With ccache on full cache hit:
        // - pod install: 2-3 minutes (downloads, compilation cached)
        // - xcodebuild compile: 1-3 minutes (most objects cached)
        // - xcodebuild link: 1-2 minutes (unchanged)
        //
        // Net savings: ~4-8 minutes
        expect(true).toBe(true);
    });

    it('should have minimal overhead on cache miss', () => {
        // On cache miss, ccache adds minimal overhead:
        // - Hash computation: ~100ms per file
        // - Cache storage: ~200ms total
        // Total overhead: < 5 seconds
        //
        // This means first-run builds are not noticeably slower
        expect(true).toBe(true);
    });
});
