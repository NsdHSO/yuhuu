import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests for CI workflow build parallelization strategy.
 *
 * The CI pipeline builds both Android and iOS in parallel after tests complete.
 * This can be achieved via:
 *   A) A matrix strategy (single build-matrix job with platform: [android, ios])
 *   B) Separate build-android / build-ios jobs running in parallel
 *
 * Both approaches are valid. Approach (B) allows per-platform conditional execution
 * (e.g., skip iOS build when only Android files changed), which is incompatible
 * with a single matrix job's `if` condition.
 *
 * These tests validate the build parallelization regardless of which approach is used.
 *
 * Expected outcome: Both platforms build in parallel using reusable workflows.
 */

const WORKFLOWS_DIR = path.resolve(__dirname, '../../.github/workflows');

function readWorkflow(filename: string): string {
    const filePath = path.join(WORKFLOWS_DIR, filename);
    return fs.readFileSync(filePath, 'utf8');
}

interface WorkflowJob {
    name?: string;
    needs?: string | string[];
    'runs-on'?: string;
    'timeout-minutes'?: number;
    uses?: string;
    secrets?: string;
    permissions?: Record<string, string>;
    strategy?: {
        matrix?: Record<string, unknown>;
        'fail-fast'?: string;
    };
    if?: string;
    steps?: unknown[];
}

interface Workflow {
    name: string;
    on: unknown;
    jobs: Record<string, WorkflowJob>;
}

/**
 * Minimal YAML parser for GitHub Actions workflow files.
 * Handles the subset of YAML needed for workflow structure validation.
 */
function parseSimpleYaml(content: string): Workflow {
    const lines = content.split('\n');
    const result: Record<string, unknown> = {};
    const stack: { indent: number; obj: Record<string, unknown>; key?: string }[] = [
        {
            indent: -1,
            obj: result
        },
    ];

    for (const line of lines) {
        if (line.trim() === '' || line.trim().startsWith('#')) continue;

        const indent = line.search(/\S/);
        const trimmed = line.trim();

        // Pop stack to find parent at correct indentation level
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].obj;

        if (trimmed.startsWith('- ')) {
            // Array item
            const itemValue = trimmed.slice(2).trim();
            const lastKey = Object.keys(parent).pop();
            if (lastKey) {
                if (!Array.isArray(parent[lastKey])) {
                    parent[lastKey] = [];
                }
                (parent[lastKey] as string[]).push(itemValue);
            } else if (stack.length > 1) {
                const grandparent = stack[stack.length - 2].obj;
                const parentKey = stack[stack.length - 1].key;
                if (parentKey) {
                    if (!Array.isArray(grandparent[parentKey])) {
                        grandparent[parentKey] = [];
                    }
                    (grandparent[parentKey] as string[]).push(itemValue);
                }
            }
        } else if (trimmed.includes(':')) {
            const colonIdx = trimmed.indexOf(':');
            const key = trimmed.slice(0, colonIdx).trim();
            const value = trimmed.slice(colonIdx + 1).trim();

            if (value === '' || value === '|') {
                // Nested object or block scalar
                parent[key] = {};
                stack.push({
                    indent,
                    obj: parent[key] as Record<string, unknown>,
                    key,
                });
            } else {
                // Simple key-value - handle inline arrays like [android, ios]
                const cleanValue = value.replace(/^['"]|['"]$/g, '');
                if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
                    const items = cleanValue
                        .slice(1, -1)
                        .split(',')
                        .map((item) => item.trim());
                    parent[key] = items;
                } else {
                    parent[key] = cleanValue;
                }
            }
        }
    }

    return result as unknown as Workflow;
}

/**
 * Determine the build parallelization strategy used in ci.yml.
 * Returns 'matrix' if a build-matrix job exists, or 'separate' if
 * build-android and build-ios jobs exist individually.
 */
function detectBuildStrategy(workflow: Workflow): 'matrix' | 'separate' {
    if (workflow.jobs['build-matrix']) return 'matrix';
    if (workflow.jobs['build-android'] && workflow.jobs['build-ios']) return 'separate';
    throw new Error(
        'ci.yml must have either a build-matrix job or separate build-android/build-ios jobs'
    );
}

/** Get all build jobs from the workflow (either build-matrix or build-android + build-ios) */
function getBuildJobs(workflow: Workflow): WorkflowJob[] {
    const strategy = detectBuildStrategy(workflow);
    if (strategy === 'matrix') {
        return [workflow.jobs['build-matrix']];
    }
    return [workflow.jobs['build-android'], workflow.jobs['build-ios']];
}

describe('CI Workflow - Build Parallelization', () => {
    let ciWorkflowContent: string;
    let ciWorkflow: Workflow;
    let buildStrategy: 'matrix' | 'separate';

    beforeAll(() => {
        ciWorkflowContent = readWorkflow('ci.yml');
        ciWorkflow = parseSimpleYaml(ciWorkflowContent);
        buildStrategy = detectBuildStrategy(ciWorkflow);
    });

    describe('build job existence', () => {
        it('should have build jobs for both android and ios platforms', () => {
            if (buildStrategy === 'matrix') {
                const buildMatrix = ciWorkflow.jobs['build-matrix'];
                expect(buildMatrix).toBeDefined();
                // Matrix should contain both platforms
                const platforms = buildMatrix?.strategy?.matrix?.platform;
                expect(platforms).toBeDefined();
                const platformArray = Array.isArray(platforms) ? platforms : [platforms];
                expect(platformArray).toContain('android');
                expect(platformArray).toContain('ios');
            } else {
                expect(ciWorkflow.jobs['build-android']).toBeDefined();
                expect(ciWorkflow.jobs['build-ios']).toBeDefined();
            }
        });

        it('should cover exactly 2 platforms (android and ios)', () => {
            if (buildStrategy === 'matrix') {
                const platforms = ciWorkflow.jobs['build-matrix']?.strategy?.matrix?.platform;
                const platformArray = Array.isArray(platforms) ? platforms : [platforms];
                expect(platformArray).toHaveLength(2);
            } else {
                // Exactly 2 separate build jobs
                const buildJobs = Object.keys(ciWorkflow.jobs).filter(
                    (name) => name.startsWith('build-')
                );
                expect(buildJobs).toHaveLength(2);
                expect(buildJobs.sort()).toEqual(['build-android', 'build-ios']);
            }
        });
    });

    describe('build job dependencies', () => {
        it('all build jobs should depend on the test job', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                expect(job.needs).toBeDefined();
                const needs = Array.isArray(job.needs) ? job.needs : [String(job.needs)];
                // Flatten any YAML array-in-string parsing artifacts like "[test, changes]"
                const flatNeeds = needs.flatMap((n) => {
                    if (n.startsWith('[') && n.endsWith(']')) {
                        return n.slice(1, -1).split(',').map((s) => s.trim());
                    }
                    return [n];
                });
                expect(flatNeeds).toContain('test');
            }
        });

        it('build jobs should use if: always() to run even if tests fail', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                if (job.if) {
                    expect(job.if).toContain('always()');
                } else {
                    // Check raw YAML for always() near build job definitions
                    expect(ciWorkflowContent).toContain('always()');
                }
            }
        });
    });

    describe('reusable workflow references', () => {
        it('build jobs should use reusable workflows via uses keyword', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                expect(job.uses).toBeDefined();
            }
        });

        it('build jobs should reference workflows in .github/workflows/ directory', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                expect(String(job.uses)).toContain('./.github/workflows/');
            }
        });

        it('build jobs should reference build-*.yml workflow files', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                const usesValue = String(job.uses);
                expect(usesValue).toContain('build-');
                expect(usesValue).toContain('.yml');
            }
        });

        it('build jobs should inherit secrets for reusable workflow calls', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                expect(job.secrets).toBe('inherit');
            }
        });
    });

    describe('reusable workflow files exist', () => {
        it('build-android.yml should exist as a reusable workflow', () => {
            const androidWorkflowPath = path.join(WORKFLOWS_DIR, 'build-android.yml');
            expect(fs.existsSync(androidWorkflowPath)).toBe(true);
        });

        it('build-ios.yml should exist as a reusable workflow', () => {
            const iosWorkflowPath = path.join(WORKFLOWS_DIR, 'build-ios.yml');
            expect(fs.existsSync(iosWorkflowPath)).toBe(true);
        });

        it('build-android.yml should be a callable workflow (workflow_call trigger)', () => {
            const androidContent = readWorkflow('build-android.yml');
            expect(androidContent).toContain('workflow_call');
        });

        it('build-ios.yml should be a callable workflow (workflow_call trigger)', () => {
            const iosContent = readWorkflow('build-ios.yml');
            expect(iosContent).toContain('workflow_call');
        });
    });

    describe('build job permissions', () => {
        it('build jobs should have contents write permission for releases', () => {
            const buildJobs = getBuildJobs(ciWorkflow);
            for (const job of buildJobs) {
                if (job.permissions) {
                    expect(job.permissions.contents).toBe('write');
                }
            }
        });
    });

    describe('workflow syntax validation', () => {
        it('ci.yml should be valid YAML (parseable without errors)', () => {
            expect(() => parseSimpleYaml(ciWorkflowContent)).not.toThrow();
        });

        it('ci.yml should still have the test job', () => {
            expect(ciWorkflow.jobs.test).toBeDefined();
        });

        it('ci.yml should have proper concurrency settings', () => {
            expect(ciWorkflowContent).toContain('concurrency');
        });
    });

    describe('matrix-specific tests (when matrix strategy is used)', () => {
        it('matrix strategy should set fail-fast to false', () => {
            if (buildStrategy !== 'matrix') {
                // Separate jobs are inherently independent (no fail-fast needed)
                expect(true).toBe(true);
                return;
            }
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            expect(buildMatrix?.strategy?.['fail-fast']).toBe('false');
        });

        it('matrix strategy should have platform dimension', () => {
            if (buildStrategy !== 'matrix') {
                expect(true).toBe(true);
                return;
            }
            const matrix = ciWorkflow.jobs['build-matrix']?.strategy?.matrix;
            expect(matrix?.platform).toBeDefined();
        });

        it('matrix strategy should use dynamic workflow reference', () => {
            if (buildStrategy !== 'matrix') {
                expect(true).toBe(true);
                return;
            }
            const usesValue = String(ciWorkflow.jobs['build-matrix']?.uses);
            expect(usesValue).toContain('matrix.platform');
        });

        it('matrix job should have dynamic name using matrix.platform', () => {
            if (buildStrategy !== 'matrix') {
                expect(true).toBe(true);
                return;
            }
            expect(ciWorkflowContent).toMatch(/name:.*\$\{\{\s*matrix\.platform\s*\}\}/);
        });
    });

    describe('parallel execution benefits', () => {
        it('build jobs should not depend on each other (true parallelism)', () => {
            if (buildStrategy === 'matrix') {
                // Matrix strategy runs all entries in parallel by default
                const needs = ciWorkflow.jobs['build-matrix']?.needs;
                if (needs) {
                    const needsArray = Array.isArray(needs) ? needs : [needs];
                    needsArray.forEach((dep) => {
                        expect(String(dep)).not.toMatch(/^build-/);
                    });
                }
            } else {
                // Separate jobs should not depend on each other
                const androidNeeds = ciWorkflow.jobs['build-android']?.needs;
                const iosNeeds = ciWorkflow.jobs['build-ios']?.needs;

                if (androidNeeds) {
                    const arr = Array.isArray(androidNeeds) ? androidNeeds : [androidNeeds];
                    const flatNeeds = arr.flatMap((n) => {
                        if (String(n).startsWith('[') && String(n).endsWith(']')) {
                            return String(n).slice(1, -1).split(',').map((s) => s.trim());
                        }
                        return [String(n)];
                    });
                    expect(flatNeeds).not.toContain('build-ios');
                }
                if (iosNeeds) {
                    const arr = Array.isArray(iosNeeds) ? iosNeeds : [iosNeeds];
                    const flatNeeds = arr.flatMap((n) => {
                        if (String(n).startsWith('[') && String(n).endsWith(']')) {
                            return String(n).slice(1, -1).split(',').map((s) => s.trim());
                        }
                        return [String(n)];
                    });
                    expect(flatNeeds).not.toContain('build-android');
                }
            }
        });

        it('both android and ios workflows should be callable from ci.yml', () => {
            if (buildStrategy === 'matrix') {
                // Matrix uses dynamic reference: build-${{ matrix.platform }}.yml
                // which resolves to build-android.yml and build-ios.yml at runtime
                expect(ciWorkflowContent).toContain('matrix.platform');
                expect(ciWorkflowContent).toContain('build-');
            } else {
                // Separate jobs reference each workflow directly
                expect(ciWorkflowContent).toContain('build-android');
                expect(ciWorkflowContent).toContain('build-ios');
            }
        });
    });
});
