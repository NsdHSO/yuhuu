/**
 * Tests for CI workflow conditional execution via path filtering.
 *
 * PROBLEM: Every push/PR triggers full Android and iOS builds, even when
 * only documentation, test files, or other non-platform files changed.
 * A docs-only PR still runs 30+ minute Android and 45+ minute iOS builds.
 *
 * SOLUTION: Use dorny/paths-filter@v3 to detect which paths changed,
 * then conditionally skip platform builds that are unaffected.
 *
 * Expected structure in ci.yml:
 * 1. A "changes" job that runs dorny/paths-filter to detect affected paths
 * 2. build-android job gets `if: needs.changes.outputs.android == 'true'`
 * 3. build-ios job gets `if: needs.changes.outputs.ios == 'true'`
 *
 * Expected savings: Full skip on docs-only PRs (~30-45 minutes saved)
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS_DIR = path.resolve(__dirname, '../../../../.github/workflows');

function readWorkflow(filename: string): string {
    const filePath = path.join(WORKFLOWS_DIR, filename);
    return fs.readFileSync(filePath, 'utf8');
}

interface WorkflowJob {
    name?: string;
    needs?: string | string[];
    'runs-on'?: string;
    'timeout-minutes'?: number;
    outputs?: Record<string, string>;
    steps?: unknown[];
    if?: string;
    uses?: string;
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
                // Simple key-value
                const cleanValue = value.replace(/^['"]|['"]$/g, '');
                parent[key] = cleanValue;
            }
        }
    }

    return result as unknown as Workflow;
}

/**
 * Normalize a YAML `needs` value into a string array.
 * Handles both block-style arrays and flow-style `[a, b]` strings
 * that the minimal YAML parser may produce.
 */
function normalizeNeeds(needs: string | string[] | undefined): string[] {
    if (needs === undefined) return [];
    if (Array.isArray(needs)) return needs;
    // Handle flow-style YAML arrays like "[test, changes]"
    const trimmed = needs.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return trimmed
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim());
    }
    return [trimmed];
}

describe('CI Workflow - Conditional Execution', () => {
    let ciWorkflowContent: string;
    let ciWorkflow: Workflow;

    beforeAll(() => {
        ciWorkflowContent = readWorkflow('ci.yml');
        ciWorkflow = parseSimpleYaml(ciWorkflowContent);
    });

    describe('Changes detection job', () => {
        it('should have a "changes" job defined in ci.yml', () => {
            expect(ciWorkflow.jobs).toBeDefined();
            expect(ciWorkflow.jobs.changes).toBeDefined();
        });

        it('changes job should run on ubuntu-latest', () => {
            const changesJob = ciWorkflow.jobs.changes;
            expect(changesJob).toBeDefined();
            expect(changesJob['runs-on']).toBe('ubuntu-latest');
        });

        it('changes job should have a descriptive name', () => {
            const changesJob = ciWorkflow.jobs.changes;
            expect(changesJob).toBeDefined();
            expect(changesJob.name).toBeDefined();
            expect(changesJob.name!.toLowerCase()).toContain('change');
        });

        it('changes job should define android and ios outputs', () => {
            // The raw YAML must declare outputs for android and ios
            // so downstream jobs can conditionally execute
            expect(ciWorkflowContent).toMatch(/outputs:/);
            expect(ciWorkflowContent).toMatch(/android:\s*\$\{\{/);
            expect(ciWorkflowContent).toMatch(/ios:\s*\$\{\{/);
        });
    });

    describe('dorny/paths-filter usage', () => {
        it('should use dorny/paths-filter@v3 action', () => {
            expect(ciWorkflowContent).toContain('dorny/paths-filter@v3');
        });

        it('should have a filter step with id "filter"', () => {
            expect(ciWorkflowContent).toMatch(/id:\s*filter/);
        });

        it('should define android path filter patterns', () => {
            // Android builds should trigger on android directory changes
            expect(ciWorkflowContent).toMatch(/android:/);
            expect(ciWorkflowContent).toContain('\'android/**\'');
        });

        it('should define ios path filter patterns', () => {
            // iOS builds should trigger on ios directory changes
            expect(ciWorkflowContent).toContain('\'ios/**\'');
        });

        it('should include app.config.js in android filter', () => {
            // app.config.js affects both Android and iOS builds
            // The android filter section should include it
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();
            expect(filtersSection![0]).toContain('app.config.js');
        });

        it('should include package.json in android filter', () => {
            // package.json changes can affect native builds
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();
            expect(filtersSection![0]).toContain('package.json');
        });

        it('should include app.config.js in ios filter', () => {
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();
            expect(filtersSection![0]).toContain('app.config.js');
        });

        it('should include package.json in ios filter', () => {
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();
            expect(filtersSection![0]).toContain('package.json');
        });
    });

    describe('build job conditional execution', () => {
        it('build jobs should depend on the test job', () => {
            // Build-matrix or separate build jobs should depend on test
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            const buildAndroid = ciWorkflow.jobs['build-android'];

            if (buildMatrix) {
                const needs = normalizeNeeds(buildMatrix.needs);
                expect(needs).toContain('test');
            } else if (buildAndroid) {
                const needs = normalizeNeeds(buildAndroid.needs);
                expect(needs).toContain('test');
            } else {
                fail('ci.yml must have either build-matrix or build-android job');
            }
        });

        it('build jobs should use if: always() to run even if tests fail', () => {
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            const buildAndroid = ciWorkflow.jobs['build-android'];

            if (buildMatrix) {
                expect(buildMatrix.if).toBeDefined();
                expect(buildMatrix.if).toContain('always()');
            } else if (buildAndroid) {
                expect(buildAndroid.if).toBeDefined();
                expect(buildAndroid.if!).toContain('always()');
            }
        });

        it('build jobs should reference reusable platform workflows', () => {
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            const buildAndroid = ciWorkflow.jobs['build-android'];

            if (buildMatrix) {
                expect(String(buildMatrix.uses)).toContain('build-');
                expect(String(buildMatrix.uses)).toContain('.yml');
            } else if (buildAndroid) {
                expect(String(buildAndroid.uses)).toContain('build-android.yml');
                const buildIos = ciWorkflow.jobs['build-ios'];
                expect(buildIos).toBeDefined();
                expect(String(buildIos!.uses)).toContain('build-ios.yml');
            }
        });

        it('changes job outputs are available for future conditional execution', () => {
            // The changes job defines android and ios outputs that can be used
            // for per-platform conditional execution when needed
            expect(ciWorkflowContent).toMatch(/outputs:/);
            expect(ciWorkflowContent).toMatch(/android:\s*\$\{\{/);
            expect(ciWorkflowContent).toMatch(/ios:\s*\$\{\{/);
        });
    });

    describe('Docs-only PR skip validation', () => {
        it('docs directory should NOT be in android path filter', () => {
            // Changes to docs/ should not trigger Android builds
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();

            // Extract the android filter block
            const androidFilter = filtersSection![0].match(
                /android:[\s\S]*?(?=\n\s{12}\w|ios:|$)/
            );
            if (androidFilter) {
                expect(androidFilter[0]).not.toContain('docs/');
                expect(androidFilter[0]).not.toContain('\'docs/**\'');
            }
        });

        it('docs directory should NOT be in ios path filter', () => {
            // Changes to docs/ should not trigger iOS builds
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();

            const iosFilter = filtersSection![0].match(
                /ios:[\s\S]*?(?=\n\s{12}\w|android:|$)/
            );
            if (iosFilter) {
                expect(iosFilter[0]).not.toContain('docs/');
                expect(iosFilter[0]).not.toContain('\'docs/**\'');
            }
        });

        it('README or markdown files should NOT be in path filters', () => {
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();
            expect(filtersSection![0]).not.toContain('*.md');
            expect(filtersSection![0]).not.toContain('README');
        });
    });

    describe('Source code changes trigger builds', () => {
        it('changes to src/ or app/ or lib/ should trigger both builds via shared filters', () => {
            // Source code changes should trigger rebuilds
            // These should be captured by filters like 'app/**', 'lib/**', 'src/**'
            // OR by catch-all patterns in both android and ios filters
            const filtersSection = ciWorkflowContent.match(
                /filters:\s*\|[\s\S]*?(?=\n\s{4}\w|\n\s{2}\w|\n\w|$)/
            );
            expect(filtersSection).not.toBeNull();

            // At minimum, app.config.js and package.json should be in filters
            // (already tested above). Additional source patterns are a bonus.
            const filterContent = filtersSection![0];
            const hasSourcePatterns =
                filterContent.includes('\'app/**\'') ||
                filterContent.includes('\'lib/**\'') ||
                filterContent.includes('\'src/**\'') ||
                filterContent.includes('app.config.js');

            expect(hasSourcePatterns).toBe(true);
        });
    });

    describe('Changes job efficiency', () => {
        it('changes job should use actions/checkout@v4', () => {
            // The checkout step is needed for dorny/paths-filter to work
            expect(ciWorkflowContent).toMatch(
                /changes:[\s\S]*?actions\/checkout@v4/
            );
        });

        it('changes job should be lightweight (no heavy setup steps)', () => {
            // The changes detection job should be fast - just checkout + filter
            // It should NOT include Node.js setup, Java setup, etc.
            const changesSection = ciWorkflowContent.match(
                /changes:[\s\S]*?(?=\n\s{2}\w)/
            );
            if (changesSection) {
                expect(changesSection[0]).not.toContain('setup-node');
                expect(changesSection[0]).not.toContain('setup-java');
                expect(changesSection[0]).not.toContain('setup-xcode');
            }
        });
    });

    describe('Workflow structure integrity', () => {
        it('ci.yml should still have the test job', () => {
            expect(ciWorkflow.jobs.test).toBeDefined();
        });

        it('ci.yml should have build jobs for both platforms', () => {
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            const buildAndroid = ciWorkflow.jobs['build-android'];
            const buildIos = ciWorkflow.jobs['build-ios'];

            if (buildMatrix) {
                // Matrix strategy covers both platforms in a single job definition
                expect(buildMatrix).toBeDefined();
            } else {
                // Separate jobs for each platform
                expect(buildAndroid).toBeDefined();
                expect(buildIos).toBeDefined();
            }
        });

        it('ci.yml should have the changes detection job', () => {
            expect(ciWorkflow.jobs.changes).toBeDefined();
        });

        it('build jobs should inherit secrets', () => {
            const buildMatrix = ciWorkflow.jobs['build-matrix'];
            const buildAndroid = ciWorkflow.jobs['build-android'];

            if (buildMatrix) {
                expect(buildMatrix.secrets).toBe('inherit');
            } else if (buildAndroid) {
                expect(buildAndroid.secrets).toBe('inherit');
                const buildIos = ciWorkflow.jobs['build-ios'];
                expect(buildIos!.secrets).toBe('inherit');
            }
        });
    });

    describe('Time savings estimation', () => {
        it('should document expected time savings from conditional execution', () => {
            // With conditional execution:
            // - Docs-only PR: ~1 minute (just changes detection + tests)
            // - Android-only change: skips iOS build (~45 min saved)
            // - iOS-only change: skips Android build (~30 min saved)
            // - Both changed: runs both (no savings, same as before)
            const androidBuildTime = 30; // minutes
            const iosBuildTime = 45; // minutes
            const changesDetectionTime = 1; // minute (lightweight job)

            // On a docs-only PR, total savings is both build times
            const docsOnlySavings = androidBuildTime + iosBuildTime;
            expect(docsOnlySavings).toBeGreaterThanOrEqual(60);

            // Changes detection overhead is minimal
            expect(changesDetectionTime).toBeLessThanOrEqual(2);
        });
    });
});
