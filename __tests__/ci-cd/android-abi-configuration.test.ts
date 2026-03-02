/**
 * Android ABI Configuration Integration Tests (YAML-parsed)
 *
 * These tests validate the Android build workflow's ABI configuration using
 * proper YAML parsing for structural correctness verification.
 *
 * Covers:
 * 1. ABI environment variable definition in workflow steps
 * 2. -PreactNativeArchitectures flag in gradlew command
 * 3. ABI consistency between prebuild and build steps
 * 4. Environment variable propagation across steps
 * 5. FAT environment targeting arm64-v8a only
 *
 * Expected savings: 4-6 minutes per non-production build (single ABI vs all 4)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
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
    'continue-on-error'?: boolean;

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

function getBuildJob(workflow: Workflow): WorkflowJob {
    const jobKey = Object.keys(workflow.jobs).find(
        (key) =>
            key.includes('build') ||
            workflow.jobs[key].steps?.some((s) => s.run?.includes('gradlew'))
    );
    if (!jobKey) throw new Error('No build job found in Android workflow');
    return workflow.jobs[jobKey];
}

function findStepByRun(
    steps: WorkflowStep[],
    runSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.run?.toLowerCase().includes(runSubstring.toLowerCase())
    );
}

function findStepByName(
    steps: WorkflowStep[],
    nameSubstring: string
): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

// ---- Test Suite: ABI Configuration via YAML ---------------------------------

describe('Android ABI Configuration - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    describe('Unit: REACT_NATIVE_ABIS in build step environment', () => {
        it('should define REACT_NATIVE_ABIS env var in the Gradle build step', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env).toBeDefined();
            expect(buildStep!.env!.REACT_NATIVE_ABIS).toBeDefined();
        });

        it('should set REACT_NATIVE_ABIS to arm64-v8a for FAT builds', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.REACT_NATIVE_ABIS).toBe('arm64-v8a');
        });

        it('should NOT include x86 or x86_64 in REACT_NATIVE_ABIS', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            const abis = buildStep!.env!.REACT_NATIVE_ABIS;
            expect(abis).not.toContain('x86_64');
            expect(abis).not.toContain('x86');
        });

        it('should NOT include armeabi-v7a in REACT_NATIVE_ABIS for FAT', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            const abis = buildStep!.env!.REACT_NATIVE_ABIS;
            expect(abis).not.toContain('armeabi-v7a');
        });
    });

    describe('Unit: -P flag in gradlew command', () => {
        it('should pass -PreactNativeArchitectures in the gradlew command', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).toContain('-PreactNativeArchitectures=');
        });

        it('should reference env.REACT_NATIVE_ABIS in the -P flag value', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.run).toMatch(
                /-PreactNativeArchitectures=\$\{\{\s*env\.REACT_NATIVE_ABIS\s*\}\}/
            );
        });
    });

    describe('Integration: ABI consistency between prebuild and build steps', () => {
        it('should have REACT_NATIVE_ABIS defined in prebuild step env', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.env).toBeDefined();
            expect(prebuildStep!.env!.REACT_NATIVE_ABIS).toBeDefined();
        });

        it('should use the same ABI value in prebuild and build steps', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            const buildStep = findStepByRun(buildSteps, 'gradlew');

            expect(prebuildStep).toBeDefined();
            expect(buildStep).toBeDefined();

            const prebuildAbis = prebuildStep!.env!.REACT_NATIVE_ABIS;
            const buildAbis = buildStep!.env!.REACT_NATIVE_ABIS;
            expect(prebuildAbis).toBe(buildAbis);
        });
    });

    describe('Integration: FAT environment configuration', () => {
        it('should target FAT environment in the build job', () => {
            const buildJob = getBuildJob(workflow);
            expect(buildJob.environment).toBe('FAT');
        });

        it('should set EXPO_PUBLIC_ENV to fat in the build step', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.EXPO_PUBLIC_ENV).toBe('fat');
        });

        it('should set EXPO_PUBLIC_ENV to fat in the prebuild step', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.env!.EXPO_PUBLIC_ENV).toBe('fat');
        });
    });

    describe('E2E: Full ABI pipeline validation', () => {
        it('should have the complete ABI flow: prebuild (arm64-v8a) -> build (-P flag)', () => {
            const prebuildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('expo prebuild')
            );
            const buildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('gradlew')
            );

            // Both steps must exist
            expect(prebuildIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);

            // Prebuild must come before build
            expect(prebuildIndex).toBeLessThan(buildIndex);

            // Both must have arm64-v8a ABI
            const prebuildStep = buildSteps[prebuildIndex];
            const buildStep = buildSteps[buildIndex];
            expect(prebuildStep.env!.REACT_NATIVE_ABIS).toBe('arm64-v8a');
            expect(buildStep.env!.REACT_NATIVE_ABIS).toBe('arm64-v8a');

            // Build step must use -P flag with env reference
            expect(buildStep.run).toContain('-PreactNativeArchitectures=');
        });

        it('should not hardcode ABI directly in the gradlew command', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            // The -P flag should reference the env var, not hardcode 'arm64-v8a'
            expect(buildStep!.run).not.toMatch(
                /-PreactNativeArchitectures=arm64-v8a\b/
            );
            expect(buildStep!.run).toContain('env.REACT_NATIVE_ABIS');
        });

        it('should have environment variables available to both prebuild and build', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            const buildStep = findStepByRun(buildSteps, 'gradlew');

            // Both steps must have env blocks
            expect(prebuildStep!.env).toBeDefined();
            expect(buildStep!.env).toBeDefined();

            // Both must have GraphQL URL from secrets
            expect(prebuildStep!.env!.EXPO_PUBLIC_GRAPHQL_URL).toBeDefined();
            expect(buildStep!.env!.EXPO_PUBLIC_GRAPHQL_URL).toBeDefined();
        });
    });
});
