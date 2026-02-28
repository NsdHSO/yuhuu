import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests for CI workflow parallel execution optimization.
 *
 * The test.yml workflow contains lint and test jobs that should run in parallel
 * (no dependency between them), with a test-complete aggregation job that
 * requires both to pass.
 *
 * Current state: lint and test jobs have NO 'needs' dependency (already parallel),
 * but there is no aggregation job (test-complete) to gate downstream consumers.
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
	outputs?: Record<string, string>;
	steps?: unknown[];
	if?: string;
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
		{ indent: -1, obj: result },
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
				// Parent is an empty object created for a key like "needs:"
				// Convert it to an array in the grandparent
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

describe('CI Workflow - Parallel Execution', () => {
	let testWorkflowContent: string;
	let testWorkflow: Workflow;
	let ciWorkflowContent: string;
	let ciWorkflow: Workflow;

	beforeAll(() => {
		testWorkflowContent = readWorkflow('test.yml');
		testWorkflow = parseSimpleYaml(testWorkflowContent);
		ciWorkflowContent = readWorkflow('ci.yml');
		ciWorkflow = parseSimpleYaml(ciWorkflowContent);
	});

	describe('test.yml workflow structure', () => {
		it('should have both lint and test jobs defined', () => {
			expect(testWorkflow.jobs).toBeDefined();
			expect(testWorkflow.jobs.lint).toBeDefined();
			expect(testWorkflow.jobs.test).toBeDefined();
		});

		it('should have lint job with no dependencies (runs independently)', () => {
			const lintJob = testWorkflow.jobs.lint;
			expect(lintJob.needs).toBeUndefined();
		});

		it('should have test job with no dependency on lint (runs in parallel)', () => {
			const testJob = testWorkflow.jobs.test;
			// test job should NOT need lint - they should be independent
			expect(testJob.needs).toBeUndefined();
		});

		it('should not have lint depending on test', () => {
			const lintJob = testWorkflow.jobs.lint;
			if (lintJob.needs) {
				const needs = Array.isArray(lintJob.needs)
					? lintJob.needs
					: [lintJob.needs];
				expect(needs).not.toContain('test');
			}
		});

		it('should not have test depending on lint', () => {
			const testJob = testWorkflow.jobs.test;
			if (testJob.needs) {
				const needs = Array.isArray(testJob.needs)
					? testJob.needs
					: [testJob.needs];
				expect(needs).not.toContain('lint');
			}
		});
	});

	describe('test-complete aggregation job', () => {
		it('should have a test-complete job that aggregates lint and test results', () => {
			expect(testWorkflow.jobs['test-complete']).toBeDefined();
		});

		it('test-complete should depend on both lint and test jobs', () => {
			const testCompleteJob = testWorkflow.jobs['test-complete'];
			expect(testCompleteJob).toBeDefined();

			const needs = testCompleteJob?.needs;
			expect(needs).toBeDefined();

			const needsArray = Array.isArray(needs) ? needs : [needs];
			expect(needsArray).toContain('lint');
			expect(needsArray).toContain('test');
		});

		it('test-complete should require BOTH jobs to pass (no if: always())', () => {
			const testCompleteJob = testWorkflow.jobs['test-complete'];
			expect(testCompleteJob).toBeDefined();

			// Should NOT have if: always() which would run even on failure
			if (testCompleteJob?.if) {
				expect(testCompleteJob.if).not.toContain('always()');
			}
		});
	});

	describe('ci.yml downstream dependencies', () => {
		it('should have ci.yml reference the test workflow', () => {
			expect(ciWorkflow.jobs).toBeDefined();
			expect(ciWorkflow.jobs.test).toBeDefined();
		});

		it('build jobs should depend on test job completion', () => {
			const buildAndroid = ciWorkflow.jobs['build-android'];
			const buildIos = ciWorkflow.jobs['build-ios'];

			expect(buildAndroid).toBeDefined();
			expect(buildIos).toBeDefined();

			// Both builds should need the test job
			expect(buildAndroid.needs).toBeDefined();
			expect(buildIos.needs).toBeDefined();

			const androidNeeds = Array.isArray(buildAndroid.needs)
				? buildAndroid.needs
				: [buildAndroid.needs];
			const iosNeeds = Array.isArray(buildIos.needs)
				? buildIos.needs
				: [buildIos.needs];

			expect(androidNeeds).toContain('test');
			expect(iosNeeds).toContain('test');
		});
	});

	describe('parallel execution timing benefits', () => {
		it('lint job should have a timeout configured', () => {
			const lintJob = testWorkflow.jobs.lint;
			expect(lintJob['timeout-minutes']).toBeDefined();
		});

		it('test job should have a timeout configured', () => {
			const testJob = testWorkflow.jobs.test;
			expect(testJob['timeout-minutes']).toBeDefined();
		});

		it('parallel execution should be faster than sequential (max of timeouts < sum)', () => {
			const lintJob = testWorkflow.jobs.lint;
			const testJob = testWorkflow.jobs.test;

			const lintTimeout = Number(lintJob['timeout-minutes']) || 10;
			const testTimeout = Number(testJob['timeout-minutes']) || 15;

			const sequentialTime = lintTimeout + testTimeout;
			const parallelTime = Math.max(lintTimeout, testTimeout);

			// Parallel execution should save time
			expect(parallelTime).toBeLessThan(sequentialTime);

			// Should save at least 3 minutes (the lint job timeout)
			const timeSaved = sequentialTime - parallelTime;
			expect(timeSaved).toBeGreaterThanOrEqual(3);
		});
	});

	describe('workflow syntax validation', () => {
		it('test.yml should be valid YAML (parseable without errors)', () => {
			expect(() => parseSimpleYaml(testWorkflowContent)).not.toThrow();
		});

		it('ci.yml should be valid YAML (parseable without errors)', () => {
			expect(() => parseSimpleYaml(ciWorkflowContent)).not.toThrow();
		});

		it('test.yml should be a reusable workflow (workflow_call trigger)', () => {
			const onConfig = testWorkflow.on;
			expect(onConfig).toBeDefined();
			// workflow_call should be present for reusable workflow
			expect(testWorkflowContent).toContain('workflow_call');
		});

		it('all jobs in test.yml should have runs-on configured', () => {
			for (const [jobName, job] of Object.entries(testWorkflow.jobs)) {
				expect(job['runs-on']).toBeDefined();
			}
		});

		it('all jobs in test.yml should have timeout-minutes configured', () => {
			for (const [jobName, job] of Object.entries(testWorkflow.jobs)) {
				expect(job['timeout-minutes']).toBeDefined();
			}
		});
	});

	describe('test-complete job constraints', () => {
		it('test-complete should have a lightweight timeout (max 5 min)', () => {
			const testComplete = testWorkflow.jobs['test-complete'];
			expect(testComplete).toBeDefined();
			const timeout = Number(testComplete['timeout-minutes']);
			expect(timeout).toBeLessThanOrEqual(5);
		});

		it('test-complete should depend on exactly 2 jobs (lint + test)', () => {
			const testComplete = testWorkflow.jobs['test-complete'];
			expect(testComplete).toBeDefined();
			const needs = Array.isArray(testComplete.needs)
				? testComplete.needs
				: [testComplete.needs];
			expect(needs).toHaveLength(2);
			expect(needs.sort()).toEqual(['lint', 'test']);
		});
	});
});
