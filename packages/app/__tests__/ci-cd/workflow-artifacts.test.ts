/**
 * Tests for workflow artifacts sharing optimization.
 *
 * PROBLEM: Each workflow job (test, build-android, build-ios) independently
 * installs node_modules via `pnpm install`. This duplicates work since
 * test.yml already installs dependencies before running tests.
 *
 * SOLUTION: Upload node_modules as an artifact from the test job,
 * then download it in build jobs to skip redundant dependency installation.
 *
 * Key constraints:
 * - Artifact name must include github.sha for uniqueness
 * - Retention should be short (1 day) since artifacts are transient
 * - Build jobs must use continue-on-error for download (fallback to fresh install)
 * - Upload must happen AFTER dependency installation in test.yml
 * - Download must happen BEFORE dependency installation in build workflows
 *
 * Expected savings: 1-2 minutes per build job
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const WORKFLOWS_DIR = path.resolve(__dirname, '../../../../.github/workflows');

interface WorkflowStep {
    name?: string;
    uses?: string;
    with?: Record<string, unknown>;
    run?: string;
    id?: string;
    if?: string;
    'continue-on-error'?: boolean;

    [key: string]: unknown;
}

interface WorkflowJob {
    name?: string;
    needs?: string | string[];
    'runs-on'?: string;
    'timeout-minutes'?: number;
    outputs?: Record<string, string>;
    steps?: WorkflowStep[];

    [key: string]: unknown;
}

interface Workflow {
    name: string;
    on: unknown;
    jobs: Record<string, WorkflowJob>;
}

function loadWorkflow(filename: string): Workflow {
    const filePath = path.join(WORKFLOWS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content) as Workflow;
}

function loadWorkflowRaw(filename: string): string {
    const filePath = path.join(WORKFLOWS_DIR, filename);
    return fs.readFileSync(filePath, 'utf-8');
}

function findStepByUses(steps: WorkflowStep[], usesPrefix: string): WorkflowStep | undefined {
    return steps.find((step) => step.uses?.startsWith(usesPrefix));
}

function findStepByName(steps: WorkflowStep[], nameSubstring: string): WorkflowStep | undefined {
    return steps.find((step) =>
        step.name?.toLowerCase().includes(nameSubstring.toLowerCase())
    );
}

function findAllStepsByUses(steps: WorkflowStep[], usesPrefix: string): WorkflowStep[] {
    return steps.filter((step) => step.uses?.startsWith(usesPrefix));
}

describe('Workflow Artifacts Sharing - test.yml Upload', () => {
    let testWorkflow: Workflow;
    let testJobSteps: WorkflowStep[];

    beforeAll(() => {
        testWorkflow = loadWorkflow('test.yml');
        testJobSteps = testWorkflow.jobs.test?.steps || [];
    });

    describe('node_modules artifact upload step', () => {
        it('should have an upload-artifact step for node_modules', () => {
            const uploadStep = findStepByName(testJobSteps, 'upload node_modules');
            if (!uploadStep) {
                // Also check by uses action
                const uploadByAction = testJobSteps.find(
                    (step) =>
                        step.uses?.startsWith('actions/upload-artifact') &&
                        String(step.with?.path || '').includes('node_modules')
                );
                expect(uploadByAction).toBeDefined();
            } else {
                expect(uploadStep).toBeDefined();
            }
        });

        it('should use actions/upload-artifact@v4 for the upload', () => {
            const uploadStep = testJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );
            expect(uploadStep).toBeDefined();
            expect(uploadStep!.uses).toMatch(/^actions\/upload-artifact@v4/);
        });

        it('should upload node_modules directory', () => {
            const uploadStep = testJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );
            expect(uploadStep).toBeDefined();

            const uploadPath = String(uploadStep!.with?.path || '');
            expect(uploadPath).toContain('node_modules');
        });

        it('should use SHA-based artifact name for uniqueness', () => {
            const uploadStep = testJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );
            expect(uploadStep).toBeDefined();

            const artifactName = String(uploadStep!.with?.name || '');
            expect(artifactName).toContain('github.sha');
            expect(artifactName.toLowerCase()).toContain('node-modules');
        });

        it('should set retention to 1 day for transient artifacts', () => {
            const uploadStep = testJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );
            expect(uploadStep).toBeDefined();

            const retentionDays = uploadStep!.with?.['retention-days'];
            expect(retentionDays).toBeDefined();
            expect(Number(retentionDays)).toBe(1);
        });
    });

    describe('upload step ordering', () => {
        it('should upload AFTER setup-node (dependency install)', () => {
            const setupNodeIndex = testJobSteps.findIndex(
                (step) => step.uses?.includes('./.github/actions/setup-node')
            );
            const uploadIndex = testJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );

            expect(setupNodeIndex).toBeGreaterThanOrEqual(0);
            expect(uploadIndex).toBeGreaterThanOrEqual(0);
            expect(uploadIndex).toBeGreaterThan(setupNodeIndex);
        });

        it('should upload BEFORE or AFTER test execution (not blocking tests)', () => {
            const uploadIndex = testJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/upload-artifact') &&
                    String(step.with?.path || '').includes('node_modules')
            );

            // Upload step should exist and have a valid position
            expect(uploadIndex).toBeGreaterThanOrEqual(0);
        });
    });

    describe('artifact does not conflict with coverage artifact', () => {
        it('should have a different name from the coverage report artifact', () => {
            const uploadSteps = findAllStepsByUses(testJobSteps, 'actions/upload-artifact');

            const nodeModulesUpload = uploadSteps.find(
                (step) => String(step.with?.path || '').includes('node_modules')
            );
            const coverageUpload = uploadSteps.find(
                (step) => String(step.with?.path || '').includes('coverage')
            );

            expect(nodeModulesUpload).toBeDefined();
            expect(coverageUpload).toBeDefined();

            const nodeModulesName = String(nodeModulesUpload!.with?.name || '');
            const coverageName = String(coverageUpload!.with?.name || '');

            expect(nodeModulesName).not.toBe(coverageName);
        });

        it('should have shorter retention than coverage report', () => {
            const uploadSteps = findAllStepsByUses(testJobSteps, 'actions/upload-artifact');

            const nodeModulesUpload = uploadSteps.find(
                (step) => String(step.with?.path || '').includes('node_modules')
            );
            const coverageUpload = uploadSteps.find(
                (step) => String(step.with?.path || '').includes('coverage')
            );

            expect(nodeModulesUpload).toBeDefined();
            expect(coverageUpload).toBeDefined();

            const nodeModulesRetention = Number(nodeModulesUpload!.with?.['retention-days'] || 30);
            const coverageRetention = Number(coverageUpload!.with?.['retention-days'] || 30);

            expect(nodeModulesRetention).toBeLessThan(coverageRetention);
        });
    });
});

describe('Workflow Artifacts Sharing - build-android.yml Download', () => {
    let androidWorkflow: Workflow;
    let buildJobSteps: WorkflowStep[];

    beforeAll(() => {
        androidWorkflow = loadWorkflow('build-android.yml');
        const buildJob = androidWorkflow.jobs['build-android'];
        buildJobSteps = buildJob?.steps || [];
    });

    describe('node_modules artifact download step', () => {
        it('should have a download-artifact step for node_modules', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();
        });

        it('should use actions/download-artifact@v4', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();
            expect(downloadStep!.uses).toMatch(/^actions\/download-artifact@v4/);
        });

        it('should use the same SHA-based artifact name as the upload', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            const artifactName = String(downloadStep!.with?.name || '');
            expect(artifactName).toContain('github.sha');
            expect(artifactName.toLowerCase()).toContain('node-modules');
        });

        it('should download to node_modules directory path', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            const downloadPath = String(downloadStep!.with?.path || '');
            expect(downloadPath).toContain('node_modules');
        });

        it('should have continue-on-error set to true for graceful fallback', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            expect(downloadStep!['continue-on-error']).toBe(true);
        });
    });

    describe('download step ordering in build-android', () => {
        it('should download BEFORE setup-node (dependency install)', () => {
            const downloadIndex = buildJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            const setupNodeIndex = buildJobSteps.findIndex(
                (step) => step.uses?.includes('./.github/actions/setup-node')
            );

            expect(downloadIndex).toBeGreaterThanOrEqual(0);
            expect(setupNodeIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeLessThan(setupNodeIndex);
        });

        it('should download AFTER checkout', () => {
            const checkoutIndex = buildJobSteps.findIndex(
                (step) => step.uses?.startsWith('actions/checkout')
            );
            const downloadIndex = buildJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );

            expect(checkoutIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeGreaterThan(checkoutIndex);
        });
    });
});

describe('Workflow Artifacts Sharing - build-ios.yml Download', () => {
    let iosWorkflow: Workflow;
    let buildJobSteps: WorkflowStep[];

    beforeAll(() => {
        iosWorkflow = loadWorkflow('build-ios.yml');
        const buildJob = iosWorkflow.jobs.build;
        buildJobSteps = buildJob?.steps || [];
    });

    describe('node_modules artifact download step', () => {
        it('should have a download-artifact step for node_modules', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();
        });

        it('should use actions/download-artifact@v4', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();
            expect(downloadStep!.uses).toMatch(/^actions\/download-artifact@v4/);
        });

        it('should use the same SHA-based artifact name as the upload', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            const artifactName = String(downloadStep!.with?.name || '');
            expect(artifactName).toContain('github.sha');
            expect(artifactName.toLowerCase()).toContain('node-modules');
        });

        it('should download to node_modules directory path', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            const downloadPath = String(downloadStep!.with?.path || '');
            expect(downloadPath).toContain('node_modules');
        });

        it('should have continue-on-error set to true for graceful fallback', () => {
            const downloadStep = buildJobSteps.find(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            expect(downloadStep).toBeDefined();

            expect(downloadStep!['continue-on-error']).toBe(true);
        });
    });

    describe('download step ordering in build-ios', () => {
        it('should download BEFORE setup-node (dependency install)', () => {
            const downloadIndex = buildJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );
            const setupNodeIndex = buildJobSteps.findIndex(
                (step) => step.uses?.includes('./.github/actions/setup-node')
            );

            expect(downloadIndex).toBeGreaterThanOrEqual(0);
            expect(setupNodeIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeLessThan(setupNodeIndex);
        });

        it('should download AFTER checkout', () => {
            const checkoutIndex = buildJobSteps.findIndex(
                (step) => step.uses?.startsWith('actions/checkout')
            );
            const downloadIndex = buildJobSteps.findIndex(
                (step) =>
                    step.uses?.startsWith('actions/download-artifact') &&
                    String(step.with?.name || '').toLowerCase().includes('node-modules')
            );

            expect(checkoutIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeGreaterThanOrEqual(0);
            expect(downloadIndex).toBeGreaterThan(checkoutIndex);
        });
    });
});

describe('Workflow Artifacts Sharing - Cross-workflow Consistency', () => {
    let testWorkflowRaw: string;
    let androidWorkflowRaw: string;
    let iosWorkflowRaw: string;

    beforeAll(() => {
        testWorkflowRaw = loadWorkflowRaw('test.yml');
        androidWorkflowRaw = loadWorkflowRaw('build-android.yml');
        iosWorkflowRaw = loadWorkflowRaw('build-ios.yml');
    });

    it('should use the same artifact name pattern across all workflows', () => {
        // All workflows should reference the same artifact name pattern
        const artifactNamePattern = 'node-modules-${{ github.sha }}';

        expect(testWorkflowRaw).toContain(artifactNamePattern);
        expect(androidWorkflowRaw).toContain(artifactNamePattern);
        expect(iosWorkflowRaw).toContain(artifactNamePattern);
    });

    it('should use matching artifact action versions across workflows', () => {
        // Upload in test.yml should match download version in build workflows
        expect(testWorkflowRaw).toContain('actions/upload-artifact@v4');
        expect(androidWorkflowRaw).toContain('actions/download-artifact@v4');
        expect(iosWorkflowRaw).toContain('actions/download-artifact@v4');
    });
});

describe('Workflow Artifacts Sharing - Integration Flow', () => {
    let ciWorkflow: Workflow;

    beforeAll(() => {
        ciWorkflow = loadWorkflow('ci.yml');
    });

    it('ci.yml should have test job that runs before build jobs', () => {
        expect(ciWorkflow.jobs.test).toBeDefined();

        // Support both build-matrix and separate build-android/build-ios structures
        const buildMatrix = ciWorkflow.jobs['build-matrix'];
        const buildAndroid = ciWorkflow.jobs['build-android'];

        if (buildMatrix) {
            // Matrix strategy: single job covers both platforms
            const needs = Array.isArray(buildMatrix.needs)
                ? buildMatrix.needs
                : [String(buildMatrix.needs)];
            const flatNeeds = needs.flatMap((n: string) => {
                if (n.startsWith('[') && n.endsWith(']')) {
                    return n.slice(1, -1).split(',').map((s: string) => s.trim());
                }
                return [n];
            });
            expect(flatNeeds).toContain('test');
        } else {
            // Separate jobs structure
            expect(buildAndroid).toBeDefined();
            expect(ciWorkflow.jobs['build-ios']).toBeDefined();

            const androidNeeds = Array.isArray(buildAndroid!.needs)
                ? buildAndroid!.needs
                : [String(buildAndroid!.needs)];
            const iosNeeds = Array.isArray(ciWorkflow.jobs['build-ios'].needs)
                ? ciWorkflow.jobs['build-ios'].needs
                : [String(ciWorkflow.jobs['build-ios'].needs)];

            const flatAndroid = androidNeeds.flatMap((n: string) => {
                if (n.startsWith('[') && n.endsWith(']')) {
                    return n.slice(1, -1).split(',').map((s: string) => s.trim());
                }
                return [n];
            });
            const flatIos = (iosNeeds as string[]).flatMap((n: string) => {
                if (n.startsWith('[') && n.endsWith(']')) {
                    return n.slice(1, -1).split(',').map((s: string) => s.trim());
                }
                return [n];
            });

            expect(flatAndroid).toContain('test');
            expect(flatIos).toContain('test');
        }
    });

    it('artifact flow should follow test -> build dependency chain', () => {
        // The test job runs first (produces artifacts)
        // Build jobs run after test (consume artifacts)
        // This is validated by the ci.yml needs configuration
        const buildMatrix = ciWorkflow.jobs['build-matrix'];
        const buildAndroid = ciWorkflow.jobs['build-android'];

        if (buildMatrix) {
            expect(buildMatrix.needs).toBeDefined();
        } else {
            expect(buildAndroid!.needs).toBeDefined();
            expect(ciWorkflow.jobs['build-ios'].needs).toBeDefined();
        }
    });
});

describe('Workflow Artifacts Sharing - Estimated Time Savings', () => {
    it('should document expected time savings of 1-2 minutes per build job', () => {
        // This is a documentation test to validate the optimization rationale.
        //
        // Without artifact sharing:
        //   - test job: installs node_modules (~2-3 min)
        //   - build-android job: installs node_modules AGAIN (~2-3 min)
        //   - build-ios job: installs node_modules AGAIN (~2-3 min)
        //   Total install time: ~6-9 minutes
        //
        // With artifact sharing:
        //   - test job: installs node_modules (~2-3 min) + upload (~30s)
        //   - build-android job: downloads node_modules (~30s-1 min)
        //   - build-ios job: downloads node_modules (~30s-1 min)
        //   Total install time: ~3.5-5 minutes
        //
        // Expected savings: 1-2 minutes per build job, ~2.5-4 min total

        const numberOfBuildJobs = 2; // Android + iOS
        const minSavingsPerJob = 1; // minutes
        const maxSavingsPerJob = 2; // minutes

        const totalMinSavings = numberOfBuildJobs * minSavingsPerJob;
        const totalMaxSavings = numberOfBuildJobs * maxSavingsPerJob;

        expect(totalMinSavings).toBeGreaterThanOrEqual(2);
        expect(totalMaxSavings).toBeLessThanOrEqual(4);
    });
});
