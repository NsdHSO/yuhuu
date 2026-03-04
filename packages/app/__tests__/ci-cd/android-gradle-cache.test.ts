/**
 * Android Gradle Cache Integration Tests (YAML-parsed)
 *
 * These tests validate the Android build workflow's Gradle caching configuration
 * using proper YAML parsing (like the iOS tests) rather than raw string matching.
 *
 * Covers:
 * 1. Gradle action step structure (uses, with, id)
 * 2. Cache-read-only configuration for branch protection
 * 3. Setup-gradle step placement relative to build step
 * 4. Gradle wrapper invocation and build flags
 * 5. Integration between setup-gradle and build step
 *
 * Expected savings: 2-3 minutes per build from intelligent Gradle caching
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../..');
const ANDROID_WORKFLOW_PATH = path.join(
    WORKSPACE_ROOT,
    '.github',
    'workflows',
    'build-android.yml'
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
    'working-directory'?: string;

    [key: string]: unknown;
}

interface WorkflowJob {
    name?: string;
    steps: WorkflowStep[];
    'runs-on'?: string;
    'timeout-minutes'?: number;
    environment?: string;

    [key: string]: unknown;
}

interface Workflow {
    name?: string;
    on?: unknown;
    jobs: Record<string, WorkflowJob>;

    [key: string]: unknown;
}

// ---- Helpers ----------------------------------------------------------------

function loadWorkflow(): Workflow {
    const content = fs.readFileSync(ANDROID_WORKFLOW_PATH, 'utf-8');
    return yaml.load(content) as Workflow;
}

function loadWorkflowRaw(): string {
    return fs.readFileSync(ANDROID_WORKFLOW_PATH, 'utf-8');
}

function findStep(
    steps: WorkflowStep[],
    nameSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findStepByUses(
    steps: WorkflowStep[],
    usesSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.uses?.toLowerCase().includes(usesSubstring.toLowerCase())
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

function getBuildJob(workflow: Workflow): WorkflowJob {
    // The Android workflow may use 'build-android' or 'build' as the job key
    const jobKey = Object.keys(workflow.jobs).find(
        (key) =>
            key.includes('build') ||
            workflow.jobs[key].steps?.some((s) =>
                s.run?.includes('gradlew')
            )
    );
    if (!jobKey) throw new Error('No build job found in Android workflow');
    return workflow.jobs[jobKey];
}

// ---- Test Suite: Parsed Workflow Structure -----------------------------------

describe('Android Gradle Cache - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];
    let workflowRaw: string;

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
        workflowRaw = loadWorkflowRaw();
    });

    describe('Unit: Setup Gradle step existence', () => {
        it('should have a Setup Gradle step using gradle/actions/setup-gradle', () => {
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
        });

        it('should use gradle/actions/setup-gradle@v4 or later', () => {
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
            const match = setupGradle!.uses?.match(/setup-gradle@v(\d+)/);
            expect(match).not.toBeNull();
            expect(parseInt(match![1], 10)).toBeGreaterThanOrEqual(4);
        });

        it('should have a descriptive name for the Setup Gradle step', () => {
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
            expect(setupGradle!.name).toBeDefined();
            expect(setupGradle!.name!.toLowerCase()).toContain('gradle');
        });
    });

    describe('Unit: Cache-read-only configuration', () => {
        it('should set cache-read-only in the setup-gradle step', () => {
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
            expect(setupGradle!.with).toBeDefined();
            expect(setupGradle!.with!['cache-read-only']).toBeDefined();
        });

        it('should use github.ref to control cache-read-only', () => {
            // Non-master branches should read from cache but not write to it
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
            const cacheReadOnly = String(setupGradle!.with!['cache-read-only'] || '');
            expect(cacheReadOnly).toContain('github.ref');
        });

        it('should reference refs/heads/master for cache-read-only check', () => {
            const setupGradle = findStepByUses(buildSteps, 'gradle/actions/setup-gradle');
            expect(setupGradle).toBeDefined();
            const cacheReadOnly = String(setupGradle!.with!['cache-read-only'] || '');
            expect(cacheReadOnly).toContain('refs/heads/master');
        });
    });

    describe('Unit: No generic actions/cache for Gradle', () => {
        it('should NOT use actions/cache with Gradle-related paths', () => {
            // gradle/actions/setup-gradle handles all Gradle caching internally
            // Generic actions/cache should NOT be used for ~/.gradle
            const cacheSteps = buildSteps.filter(
                (step) => step.uses?.startsWith('actions/cache')
            );

            for (const cacheStep of cacheSteps) {
                const cachePath = String(cacheStep.with?.path || '');
                expect(cachePath).not.toContain('~/.gradle');
                expect(cachePath).not.toContain('.gradle/caches');
                expect(cachePath).not.toContain('.gradle/wrapper');
            }
        });

        it('should NOT have manual cache keys with gradle file hashes', () => {
            const cacheSteps = buildSteps.filter(
                (step) => step.uses?.startsWith('actions/cache')
            );

            for (const cacheStep of cacheSteps) {
                const cacheKey = String(cacheStep.with?.key || '');
                // Generic Gradle cache keys use *.gradle* hash patterns
                const isGradleKey =
                    cacheKey.includes('.gradle') && cacheKey.includes('hashFiles');
                if (isGradleKey) {
                    fail('Found generic actions/cache with Gradle hashFiles key');
                }
            }
        });
    });

    describe('Integration: Setup Gradle step ordering', () => {
        it('should place Setup Gradle after Java setup', () => {
            const javaIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-java')
            );
            const gradleIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-gradle')
            );

            expect(javaIndex).toBeGreaterThanOrEqual(0);
            expect(gradleIndex).toBeGreaterThanOrEqual(0);
            expect(gradleIndex).toBeGreaterThan(javaIndex);
        });

        it('should place Setup Gradle before the Gradle build step', () => {
            const gradleIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-gradle')
            );
            const buildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('gradlew')
            );

            expect(gradleIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);
            expect(gradleIndex).toBeLessThan(buildIndex);
        });

        it('should place Setup Gradle after prebuild step', () => {
            const prebuildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('expo prebuild')
            );
            const gradleIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-gradle')
            );

            expect(prebuildIndex).toBeGreaterThanOrEqual(0);
            expect(gradleIndex).toBeGreaterThanOrEqual(0);
            expect(gradleIndex).toBeGreaterThan(prebuildIndex);
        });
    });

    describe('Integration: Build command uses Gradle wrapper', () => {
        it('should invoke ./gradlew in the build step', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).toContain('./gradlew');
        });

        it('should use assembleRelease task', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).toContain('assembleRelease');
        });

        it('should NOT pass --configuration-cache flag (Expo SDK 54 incompatible)', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).not.toContain('--configuration-cache');
        });

        it('should disable configuration cache in gradle.properties (Expo SDK 54 compatibility)', () => {
            const disableConfigCacheStep = buildSteps.find(
                (step) => step.name?.includes('Disable Gradle configuration cache')
            );
            expect(disableConfigCacheStep).toBeDefined();
            expect(disableConfigCacheStep!.run).toContain('org.gradle.configuration-cache=false');
            expect(disableConfigCacheStep!.run).toContain('packages/app/android/gradle.properties');
        });

        it('should set working-directory to android/', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!['working-directory']).toBe('packages/app/android');
        });
    });

    describe('E2E: Complete Gradle cache setup validation', () => {
        it('should have the complete cache setup flow: Java -> Setup Gradle -> Build', () => {
            const javaIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-java')
            );
            const gradleSetupIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('setup-gradle')
            );
            const buildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('gradlew')
            );

            // All three must exist
            expect(javaIndex).toBeGreaterThanOrEqual(0);
            expect(gradleSetupIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);

            // Order must be: Java -> Setup Gradle -> Build
            expect(javaIndex).toBeLessThan(gradleSetupIndex);
            expect(gradleSetupIndex).toBeLessThan(buildIndex);
        });

        it('should not have duplicate Setup Gradle steps', () => {
            const setupGradleSteps = buildSteps.filter(
                (step) => step.uses?.includes('setup-gradle')
            );
            expect(setupGradleSteps.length).toBe(1);
        });

        it('should use Java 17 for Gradle compatibility', () => {
            const javaStep = findStepByUses(buildSteps, 'setup-java');
            expect(javaStep).toBeDefined();
            expect(javaStep!.with).toBeDefined();
            expect(String(javaStep!.with!['java-version'])).toBe('17');
        });

        it('should use temurin distribution for Java', () => {
            const javaStep = findStepByUses(buildSteps, 'setup-java');
            expect(javaStep).toBeDefined();
            expect(javaStep!.with).toBeDefined();
            expect(javaStep!.with!.distribution).toBe('temurin');
        });
    });
});
