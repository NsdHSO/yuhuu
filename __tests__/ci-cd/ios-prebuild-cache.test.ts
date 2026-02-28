import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

const WORKFLOW_PATH = resolve(__dirname, '../../.github/workflows/build-ios.yml');

interface WorkflowStep {
    name?: string;
    uses?: string;
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

function findStep(steps: WorkflowStep[], nameSubstring: string): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findRunStep(steps: WorkflowStep[], nameSubstring: string): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase()) && step.run != null
    );
}

function findCacheStep(steps: WorkflowStep[], pathContains: string): WorkflowStep | undefined {
    return steps.find(
        (step) =>
            step.uses?.startsWith('actions/cache') &&
            String(step.with?.path || '').includes(pathContains)
    );
}

describe('iOS Build Workflow - Prebuild Cache Optimization', () => {
    let workflow: Workflow;
    let buildSteps: WorkflowStep[];

    beforeAll(() => {
        workflow = loadWorkflow();
        buildSteps = workflow.jobs.build.steps;
    });

    it('should have a valid workflow file', () => {
        expect(workflow).toBeDefined();
        expect(workflow.jobs.build).toBeDefined();
    });

    describe('Prebuild command', () => {
        it('should have a prebuild step', () => {
            const prebuildStep = findRunStep(buildSteps, 'prebuild');
            expect(prebuildStep).toBeDefined();
        });

        it('should NOT use --clean flag in prebuild command', () => {
            const prebuildStep = findRunStep(buildSteps, 'prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.run).toBeDefined();
            expect(prebuildStep!.run).not.toContain('--clean');
        });

        it('should run expo prebuild for iOS platform', () => {
            const prebuildStep = findRunStep(buildSteps, 'prebuild');
            expect(prebuildStep).toBeDefined();
            expect(prebuildStep!.run).toContain('expo prebuild');
            expect(prebuildStep!.run).toContain('--platform ios');
        });
    });

    describe('iOS directory cache', () => {
        it('should have a cache step for the ios/ directory', () => {
            const cacheStep = findCacheStep(buildSteps, 'ios');
            expect(cacheStep).toBeDefined();
        });

        it('should cache ios/ directory path', () => {
            const iosCache = buildSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('ios/')
            );
            expect(iosCache).toBeDefined();
            // The cache path should include ios/ (the prebuild output)
            const cachePath = String(iosCache!.with?.path || '');
            expect(cachePath).toMatch(/ios\//);
        });

        it('should use cache key that hashes app.config, app.json, and package.json', () => {
            const prebuildCache = buildSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    step.name?.toLowerCase().includes('prebuild')
            );

            expect(prebuildCache).toBeDefined();
            const cacheKey = String(prebuildCache!.with?.key || '');

            // Cache key must include all three config files for proper invalidation:
            // - app.config: Expo plugin config changes
            // - app.json: app metadata changes
            // - package.json: dependency changes (including Expo SDK version)
            expect(cacheKey).toContain('app.config');
            expect(cacheKey).toContain('app.json');
            expect(cacheKey).toContain('package.json');
        });

        it('should have restore-keys for fallback cache matching', () => {
            const iosCache = buildSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('ios/')
            );

            if (iosCache) {
                const restoreKeys = iosCache.with?.['restore-keys'];
                expect(restoreKeys).toBeDefined();
            }
        });
    });

    describe('Prebuild cache workflow', () => {
        it('should place cache step before prebuild step', () => {
            const cacheIndex = buildSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/cache') &&
                    String(step.with?.path || '').includes('ios/')
            );

            const prebuildIndex = buildSteps.findIndex((step) =>
                step.name?.toLowerCase().includes('prebuild')
            );

            // If both exist, cache should come before prebuild
            if (cacheIndex >= 0 && prebuildIndex >= 0) {
                expect(cacheIndex).toBeLessThan(prebuildIndex);
            }
        });

        it('should not have redundant --clean flag that defeats caching', () => {
            // Any step that runs expo prebuild should not use --clean
            const prebuildSteps = buildSteps.filter(
                (step) => step.run && step.run.includes('expo prebuild')
            );

            for (const step of prebuildSteps) {
                expect(step.run).not.toContain('--clean');
            }
        });
    });
});
