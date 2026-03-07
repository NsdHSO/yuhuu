/**
 * Android Prebuild Cache Integration Tests (YAML-parsed)
 *
 * These tests provide YAML-parsed structural validation for the Android
 * prebuild caching, signing configuration, environment variables, artifact
 * upload, and deploy job configuration.
 *
 * Covers:
 * 1. Prebuild cache step structure (id, uses, with)
 * 2. Cache key hash files validation
 * 3. Conditional prebuild execution based on cache hit
 * 4. Android signing configuration step
 * 5. Environment variable validation step
 * 6. Artifact upload configuration
 * 7. Deploy job structure and dependencies
 * 8. Full workflow step ordering (end-to-end)
 *
 * Expected savings: 2-3 minutes per build from prebuild caching
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
    'continue-on-error'?: boolean;

    [key: string]: unknown;
}

interface WorkflowJob {
    name?: string;
    needs?: string | string[];
    steps: WorkflowStep[];
    'runs-on'?: string;
    'timeout-minutes'?: number;
    environment?: string;
    permissions?: Record<string, string>;

    [key: string]: unknown;
}

interface Workflow {
    name?: string;
    on?: unknown;
    concurrency?: Record<string, unknown>;
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
            key.includes('build') &&
            workflow.jobs[key].steps?.some((s) => s.run?.includes('gradlew'))
    );
    if (!jobKey) throw new Error('No build job found in Android workflow');
    return workflow.jobs[jobKey];
}

function getDeployJob(workflow: Workflow): WorkflowJob | undefined {
    const jobKey = Object.keys(workflow.jobs).find(
        (key) => key.includes('deploy')
    );
    return jobKey ? workflow.jobs[jobKey] : undefined;
}

function findStepByName(
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

// ---- Test Suite: Prebuild Cache Structure -----------------------------------

describe('Android Prebuild Cache - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    describe('Unit: Cache step structure', () => {
        it('should have a cache step for the android/ directory', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
        });

        it('should use actions/cache@v4 for prebuild caching', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            expect(cacheStep!.uses).toMatch(/^actions\/cache@v4/);
        });

        it('should have an id for cache-hit detection', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            expect(cacheStep!.id).toBeDefined();
            expect(cacheStep!.id!.length).toBeGreaterThan(0);
        });

        it('should have a descriptive name containing "prebuild"', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            expect(cacheStep!.name).toBeDefined();
            expect(cacheStep!.name!.toLowerCase()).toContain('prebuild');
        });
    });

    describe('Unit: Cache key configuration', () => {
        it('should include runner.os in the cache key', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('runner.os');
        });

        it('should hash app.config.js in the cache key', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('app.config');
        });

        it('should hash package.json in the cache key', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('package.json');
        });

        it('should hash pnpm-lock.yaml in the cache key', () => {
            // pnpm-lock.yaml changes when dependencies update
            // Including it ensures cache invalidates on dependency changes
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('pnpm-lock.yaml');
        });

        it('should use hashFiles function in the cache key', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const key = String(cacheStep!.with?.key || '');
            expect(key).toContain('hashFiles');
        });

        it('should NOT have restore-keys to prevent stale cache usage', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            expect(cacheStep).toBeDefined();
            const restoreKeys = cacheStep!.with?.['restore-keys'];
            expect(restoreKeys).toBeUndefined();
        });
    });

    describe('Unit: Conditional prebuild execution', () => {
        it('should have an if condition on the prebuild step', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.if).toBeDefined();
        });

        it('should skip prebuild when cache-hit is true', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.if).toContain('cache-hit');
            expect(prebuildStep!.if).toContain("!= 'true'");
        });

        it('should reference the cache step id in the if condition', () => {
            const cacheStep = findCacheStep(buildSteps, 'android/');
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');

            expect(cacheStep).toBeDefined();
            expect(prebuildStep).toBeDefined();

            const cacheId = cacheStep!.id!;
            expect(prebuildStep!.if).toContain(`steps.${cacheId}`);
        });

        it('should NOT use --clean flag in prebuild command', () => {
            const prebuildStep = findStepByRun(buildSteps, 'expo prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.run).not.toContain('--clean');
        });
    });
});

// ---- Test Suite: Signing Configuration --------------------------------------

describe('Android Signing Configuration - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    describe('Unit: Keystore generation step', () => {
        it('should have a keystore generation step', () => {
            const keystoreStep = findStepByRun(buildSteps, 'keytool');
            expect(keystoreStep).toBeDefined();
        });

        it('should create android/app directory before keystore generation', () => {
            const keystoreStep = findStepByRun(buildSteps, 'keytool');
            expect(keystoreStep).toBeDefined();
            expect(keystoreStep!.run).toContain('mkdir -p packages/app/android/app');
        });

        it('should generate a PKCS12 keystore', () => {
            const keystoreStep = findStepByRun(buildSteps, 'keytool');
            expect(keystoreStep).toBeDefined();
            expect(keystoreStep!.run).toContain('PKCS12');
        });

        it('should use RSA 2048 key algorithm', () => {
            const keystoreStep = findStepByRun(buildSteps, 'keytool');
            expect(keystoreStep).toBeDefined();
            expect(keystoreStep!.run).toContain('RSA');
            expect(keystoreStep!.run).toContain('2048');
        });
    });

    describe('Unit: Signing environment variables in build step', () => {
        it('should set MYAPP_RELEASE_STORE_FILE', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.MYAPP_RELEASE_STORE_FILE).toBeDefined();
        });

        it('should set MYAPP_RELEASE_KEY_ALIAS', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.MYAPP_RELEASE_KEY_ALIAS).toBeDefined();
        });

        it('should set MYAPP_RELEASE_STORE_PASSWORD from secrets', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.MYAPP_RELEASE_STORE_PASSWORD).toBeDefined();
        });

        it('should set MYAPP_RELEASE_KEY_PASSWORD from secrets', () => {
            const buildStep = findStepByRun(buildSteps, 'gradlew');
            expect(buildStep).toBeDefined();
            expect(buildStep!.env!.MYAPP_RELEASE_KEY_PASSWORD).toBeDefined();
        });
    });

    describe('Unit: Signing configuration script step', () => {
        it('should have a configure signing step', () => {
            const signingStep = findStepByRun(buildSteps, 'configure-android-signing');
            expect(signingStep).toBeDefined();
        });

        it('should make signing script executable', () => {
            const signingStep = findStepByRun(buildSteps, 'configure-android-signing');
            expect(signingStep).toBeDefined();
            expect(signingStep!.run).toContain('chmod +x');
        });
    });

    describe('Integration: Signing step ordering', () => {
        it('should place keystore generation before signing configuration', () => {
            const keystoreIndex = buildSteps.findIndex(
                (step) => step.run?.includes('keytool')
            );
            const signingIndex = buildSteps.findIndex(
                (step) => step.run?.includes('configure-android-signing')
            );

            expect(keystoreIndex).toBeGreaterThanOrEqual(0);
            expect(signingIndex).toBeGreaterThanOrEqual(0);
            expect(keystoreIndex).toBeLessThan(signingIndex);
        });

        it('should place signing configuration before Gradle build', () => {
            const signingIndex = buildSteps.findIndex(
                (step) => step.run?.includes('configure-android-signing')
            );
            const buildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('gradlew')
            );

            expect(signingIndex).toBeGreaterThanOrEqual(0);
            expect(buildIndex).toBeGreaterThanOrEqual(0);
            expect(signingIndex).toBeLessThan(buildIndex);
        });
    });
});

// ---- Test Suite: Environment Variable Validation ----------------------------

describe('Android Environment Variable Validation - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    describe('Unit: Validation step existence', () => {
        it('should have an environment variable validation step', () => {
            const validationStep = findStepByName(buildSteps, 'validate environment');
            expect(validationStep).toBeDefined();
        });

        it('should check EXPO_PUBLIC_GRAPHQL_URL is set', () => {
            const validationStep = findStepByName(buildSteps, 'validate environment');
            expect(validationStep).toBeDefined();
            expect(validationStep!.run).toContain('EXPO_PUBLIC_GRAPHQL_URL');
        });

        it('should reject localhost URLs', () => {
            const validationStep = findStepByName(buildSteps, 'validate environment');
            expect(validationStep).toBeDefined();
            expect(validationStep!.run).toContain('localhost');
        });

        it('should have exit 1 on validation failure', () => {
            const validationStep = findStepByName(buildSteps, 'validate environment');
            expect(validationStep).toBeDefined();
            expect(validationStep!.run).toContain('exit 1');
        });
    });

    describe('Integration: Validation step ordering', () => {
        it('should place validation before prebuild', () => {
            const validationIndex = buildSteps.findIndex(
                (step) => step.name?.toLowerCase().includes('validate environment')
            );
            const prebuildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('expo prebuild')
            );

            expect(validationIndex).toBeGreaterThanOrEqual(0);
            expect(prebuildIndex).toBeGreaterThanOrEqual(0);
            expect(validationIndex).toBeLessThan(prebuildIndex);
        });

        it('should place validation after Expo setup', () => {
            const expoIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('expo-github-action')
            );
            const validationIndex = buildSteps.findIndex(
                (step) => step.name?.toLowerCase().includes('validate environment')
            );

            expect(expoIndex).toBeGreaterThanOrEqual(0);
            expect(validationIndex).toBeGreaterThanOrEqual(0);
            expect(expoIndex).toBeLessThan(validationIndex);
        });
    });
});

// ---- Test Suite: Artifact Upload Configuration ------------------------------

describe('Android Artifact Upload - YAML Structure', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    describe('Unit: Upload artifact step', () => {
        it('should have an artifact upload step', () => {
            const uploadStep = findStepByUses(buildSteps, 'upload-artifact');
            expect(uploadStep).toBeDefined();
        });

        it('should use actions/upload-artifact@v4', () => {
            const uploadStep = findStepByUses(buildSteps, 'upload-artifact');
            expect(uploadStep).toBeDefined();
            expect(uploadStep!.uses).toMatch(/^actions\/upload-artifact@v4/);
        });

        it('should upload from the APK output path', () => {
            const uploadStep = findStepByUses(buildSteps, 'upload-artifact');
            expect(uploadStep).toBeDefined();
            const artifactPath = String(uploadStep!.with?.path || '');
            expect(artifactPath).toContain('android/app/build/outputs/apk/release');
        });

        it('should include github.sha in artifact name for uniqueness', () => {
            const uploadStep = findStepByUses(buildSteps, 'upload-artifact');
            expect(uploadStep).toBeDefined();
            const artifactName = String(uploadStep!.with?.name || '');
            expect(artifactName).toContain('github.sha');
        });

        it('should set retention-days for artifact cleanup', () => {
            const uploadStep = findStepByUses(buildSteps, 'upload-artifact');
            expect(uploadStep).toBeDefined();
            expect(uploadStep!.with?.['retention-days']).toBeDefined();
        });
    });

    describe('Integration: Upload step ordering', () => {
        it('should place artifact upload after Gradle build step', () => {
            const buildIndex = buildSteps.findIndex(
                (step) => step.run?.includes('gradlew')
            );
            const uploadIndex = buildSteps.findIndex(
                (step) => step.uses?.includes('upload-artifact')
            );

            expect(buildIndex).toBeGreaterThanOrEqual(0);
            expect(uploadIndex).toBeGreaterThanOrEqual(0);
            expect(uploadIndex).toBeGreaterThan(buildIndex);
        });
    });
});

// ---- Test Suite: Deploy Job Structure ---------------------------------------

describe('Android Deploy Job - YAML Structure', () => {
    let workflow: Workflow;
    let deployJob: WorkflowJob | undefined;

    beforeAll(() => {
        workflow = loadWorkflow();
        deployJob = getDeployJob(workflow);
    });

    describe('Unit: Deploy job existence and configuration', () => {
        it('should have a deploy job', () => {
            expect(deployJob).toBeDefined();
        });

        it('should run on ubuntu-latest', () => {
            expect(deployJob).toBeDefined();
            expect(deployJob!['runs-on']).toBe('ubuntu-latest');
        });

        it('should target FAT environment', () => {
            expect(deployJob).toBeDefined();
            expect(deployJob!.environment).toBe('FAT');
        });

        it('should have contents:write permission', () => {
            expect(deployJob).toBeDefined();
            expect(deployJob!.permissions).toBeDefined();
            expect(deployJob!.permissions!.contents).toBe('write');
        });
    });

    describe('Integration: Deploy job dependencies', () => {
        it('should depend on the build job', () => {
            expect(deployJob).toBeDefined();
            const needs = Array.isArray(deployJob!.needs)
                ? deployJob!.needs
                : [String(deployJob!.needs)];
            const hasBuildDep = needs.some((n) => n.includes('build'));
            expect(hasBuildDep).toBe(true);
        });
    });

    describe('Integration: Deploy steps', () => {
        it('should download the APK artifact', () => {
            expect(deployJob).toBeDefined();
            const downloadStep = findStepByUses(
                deployJob!.steps,
                'download-artifact'
            );
            expect(downloadStep).toBeDefined();
        });

        it('should create a GitHub release', () => {
            expect(deployJob).toBeDefined();
            const releaseStep = findStepByUses(
                deployJob!.steps,
                'action-gh-release'
            );
            expect(releaseStep).toBeDefined();
        });
    });
});

// ---- Test Suite: Workflow-level Configuration -------------------------------

describe('Android Workflow Configuration - YAML Structure', () => {
    let workflow: Workflow;

    beforeAll(() => {
        workflow = loadWorkflow();
    });

    describe('Unit: Workflow triggers', () => {
        it('should be triggered by workflow_call', () => {
            const on = workflow.on;
            if (typeof on === 'string') {
                expect(on).toBe('workflow_call');
            } else if (typeof on === 'object' && on !== null) {
                expect(on).toHaveProperty('workflow_call');
            }
        });
    });

    describe('Unit: Concurrency settings', () => {
        it('should NOT have concurrency (parent ci.yml handles it)', () => {
            // Concurrency removed from child workflows to prevent queuing
            // Only parent ci.yml workflow has concurrency control
            expect(workflow.concurrency).toBeUndefined();
        });

        it('concurrency is controlled by parent CI pipeline', () => {
            // This is a workflow_call workflow, so concurrency is handled by ci.yml
            expect(workflow.on).toHaveProperty('workflow_call');
        });
    });

    describe('Unit: Build job timeout', () => {
        it('should have a timeout set for the build job', () => {
            const buildJob = getBuildJob(workflow);
            expect(buildJob['timeout-minutes']).toBeDefined();
        });

        it('should set timeout to 30 minutes or less', () => {
            const buildJob = getBuildJob(workflow);
            expect(buildJob['timeout-minutes']).toBeLessThanOrEqual(30);
        });

        it('should set timeout to at least 15 minutes', () => {
            const buildJob = getBuildJob(workflow);
            expect(buildJob['timeout-minutes']).toBeGreaterThanOrEqual(15);
        });
    });
});

// ---- Test Suite: Full Step Ordering -----------------------------------------

describe('Android Workflow - Full Step Ordering (E2E)', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        const buildJob = getBuildJob(workflow);
        buildSteps = buildJob.steps;
    });

    it('should have steps in the correct overall order', () => {
        const stepOrder = [
            {name: 'checkout', finder: (s: WorkflowStep) => s.uses?.includes('actions/checkout')},
            {
                name: 'node setup',
                finder: (s: WorkflowStep) => s.uses?.includes('setup-node') || s.name?.toLowerCase().includes('node')
            },
            {name: 'java setup', finder: (s: WorkflowStep) => s.uses?.includes('setup-java')},
            {name: 'android sdk', finder: (s: WorkflowStep) => s.uses?.includes('setup-android')},
            {name: 'expo setup', finder: (s: WorkflowStep) => s.uses?.includes('expo-github-action')},
            {
                name: 'env validation',
                finder: (s: WorkflowStep) => s.name?.toLowerCase().includes('validate environment')
            },
            {
                name: 'prebuild cache',
                finder: (s: WorkflowStep) => s.uses?.includes('actions/cache') && String(s.with?.path || '').includes('android/')
            },
            {name: 'prebuild', finder: (s: WorkflowStep) => !!s.run?.includes('expo prebuild')},
            {name: 'signing config', finder: (s: WorkflowStep) => !!s.run?.includes('configure-android-signing')},
            {name: 'setup gradle', finder: (s: WorkflowStep) => s.uses?.includes('setup-gradle')},
            {name: 'gradle build', finder: (s: WorkflowStep) => !!s.run?.includes('gradlew')},
            {name: 'upload artifact', finder: (s: WorkflowStep) => s.uses?.includes('upload-artifact')},
        ];

        let lastIndex = -1;
        for (const step of stepOrder) {
            const index = buildSteps.findIndex(step.finder);
            if (index >= 0) {
                expect(index).toBeGreaterThan(lastIndex);
                lastIndex = index;
            }
        }
    });

    it('should have at least 10 steps in the build job', () => {
        expect(buildSteps.length).toBeGreaterThanOrEqual(10);
    });

    it('should not have any steps without a name', () => {
        // Every step should have a descriptive name for CI visibility
        for (const step of buildSteps) {
            if (!step.uses?.includes('setup-node')) {
                // Composite actions used via 'uses: ./' may not need names
                if (!step.uses?.startsWith('./')) {
                    expect(step.name).toBeDefined();
                }
            }
        }
    });
});
