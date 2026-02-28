/**
 * Tests for Gradle build action upgrade and caching optimization
 *
 * PROBLEM: Current workflow uses actions/cache@v4 for Gradle caching.
 * This is a generic cache action that doesn't understand Gradle's structure.
 *
 * ISSUES with current approach:
 * 1. Manual cache key management (fragile hash patterns)
 * 2. No configuration cache support
 * 3. No cache-read-only mode for branches (wastes cache space)
 * 4. No dependency graph tracking
 *
 * SOLUTION: Migrate to gradle/actions/setup-gradle@v4 which provides:
 * 1. Automatic Gradle cache management (understands .gradle structure)
 * 2. Configuration cache support (skips re-configuration)
 * 3. cache-read-only mode for non-default branches
 * 4. Smart cache key generation
 *
 * Expected savings: 2-3 minutes per build from better caching
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const ANDROID_WORKFLOW_PATH = path.join(WORKSPACE_ROOT, '.github', 'workflows', 'build-android.yml');

function loadWorkflow(): string {
    return fs.readFileSync(ANDROID_WORKFLOW_PATH, 'utf-8');
}

describe('Gradle Build Action Configuration', () => {
    let workflowContent: string;

    beforeAll(() => {
        workflowContent = loadWorkflow();
    });

    describe('Gradle action selection', () => {
        it('should use gradle/actions/setup-gradle instead of actions/cache for Gradle', () => {
            // CURRENT (RED): uses actions/cache@v4 with manual paths
            //   - name: Cache Gradle dependencies
            //     uses: actions/cache@v4
            //     with:
            //       path: |
            //         ~/.gradle/caches
            //         ~/.gradle/wrapper
            //
            // EXPECTED (GREEN): uses gradle/actions/setup-gradle@v4
            //   - name: Setup Gradle
            //     uses: gradle/actions/setup-gradle@v4

            expect(workflowContent).toContain('gradle/actions/setup-gradle');
        });

        it('should NOT use generic actions/cache for Gradle dependencies', () => {
            // The generic cache action doesn't understand Gradle's cache structure
            // It can restore stale or incompatible caches, causing build failures
            //
            // gradle/actions/setup-gradle handles this automatically:
            // - Cleans up stale entries
            // - Handles lock file conflicts
            // - Understands daemon vs project caches

            // Check that actions/cache is NOT used for Gradle-related caching
            const lines = workflowContent.split('\n');
            let inGradleCacheBlock = false;

            for (const line of lines) {
                if (line.includes('Cache Gradle') || (line.includes('gradle') && line.includes('cache'))) {
                    inGradleCacheBlock = true;
                }
                if (inGradleCacheBlock && line.includes('uses:')) {
                    expect(line).not.toContain('actions/cache@');
                    inGradleCacheBlock = false;
                }
            }
        });

        it('should use version v4 or later of setup-gradle', () => {
            const match = workflowContent.match(/gradle\/actions\/setup-gradle@v(\d+)/);
            expect(match).not.toBeNull();
            if (match) {
                expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(4);
            }
        });
    });

    describe('Cache configuration', () => {
        it('should set cache-read-only for non-master branches', () => {
            // Non-master branches should read from cache but not write to it
            // This prevents cache pollution from feature branches
            // Only master builds should populate the cache
            //
            // Expected configuration:
            //   cache-read-only: ${{ github.ref != 'refs/heads/master' }}

            expect(workflowContent).toMatch(/cache-read-only/);
        });

        it('should not manually specify Gradle cache paths', () => {
            // gradle/actions/setup-gradle automatically manages:
            // - ~/.gradle/caches
            // - ~/.gradle/wrapper
            // - ~/.gradle/configuration-cache
            // - project-level .gradle directories
            //
            // Manual path specification is an antipattern with setup-gradle

            // Should NOT have manual cache paths for Gradle
            const hasManualGradlePaths =
                workflowContent.includes('~/.gradle/caches') &&
                workflowContent.includes('~/.gradle/wrapper');

            expect(hasManualGradlePaths).toBe(false);
        });

        it('should not have manual cache key with gradle file hashes', () => {
            // CURRENT (RED):
            //   key: ${{ runner.os }}-gradle-${{ hashFiles('android/**/*.gradle*', ...) }}
            //
            // EXPECTED (GREEN): no manual key, setup-gradle handles it
            //
            // Manual keys are fragile and don't account for:
            // - gradle.properties changes
            // - buildSrc changes
            // - Included build changes

            expect(workflowContent).not.toMatch(
                /key:.*gradle.*hashFiles/
            );
        });
    });

    describe('Configuration cache', () => {
        it('should enable Gradle configuration cache', () => {
            // Gradle configuration cache stores the result of the configuration phase
            // On subsequent builds, Gradle skips re-evaluating build scripts
            //
            // Expected: configuration-cache-enabled: true
            // Or via gradle.properties: org.gradle.configuration-cache=true

            const hasConfigCache =
                workflowContent.includes('configuration-cache') ||
                workflowContent.includes('org.gradle.configuration-cache');

            expect(hasConfigCache).toBe(true);
        });
    });

    describe('Build command optimization', () => {
        it('should use Gradle wrapper via setup-gradle instead of direct invocation', () => {
            // setup-gradle configures the Gradle wrapper and adds it to PATH
            // The build step should still use ./gradlew for reproducibility
            expect(workflowContent).toContain('gradlew');
        });

        it('should have assembleRelease as the build task', () => {
            expect(workflowContent).toContain('assembleRelease');
        });
    });
});

describe('Gradle Properties for CI Optimization', () => {
    let gradleProperties: string;

    beforeAll(() => {
        const gradlePath = path.join(WORKSPACE_ROOT, 'android', 'gradle.properties');
        gradleProperties = fs.readFileSync(gradlePath, 'utf-8');
    });

    it('should have parallel builds enabled', () => {
        expect(gradleProperties).toContain('org.gradle.parallel=true');
    });

    it('should have sufficient JVM memory for CI builds', () => {
        // CI runners have limited memory; -Xmx2048m is a good balance
        const jvmArgs = gradleProperties.match(/org\.gradle\.jvmargs=(.+)/);
        expect(jvmArgs).not.toBeNull();
        if (jvmArgs) {
            expect(jvmArgs[1]).toContain('-Xmx');
        }
    });

    it('should have Hermes engine enabled', () => {
        // Hermes improves build time and runtime performance
        expect(gradleProperties).toContain('hermesEnabled=true');
    });
});
