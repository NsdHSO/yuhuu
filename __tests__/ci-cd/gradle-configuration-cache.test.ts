/**
 * Tests for Gradle configuration cache settings in gradle.properties
 *
 * PROBLEM: Without configuration cache, Gradle re-evaluates all build scripts
 * on every build, even when nothing has changed. This adds 2-3 minutes per build.
 *
 * SOLUTION: Enable Gradle configuration cache in gradle.properties:
 * 1. org.gradle.configuration-cache=true - Caches the configuration phase result
 * 2. org.gradle.configuration-cache.problems=warn - Warns on incompatibilities instead of failing
 * 3. org.gradle.caching=true - Enables Gradle build cache for task output caching
 *
 * Together these settings allow Gradle to:
 * - Skip re-evaluating build scripts when nothing changed
 * - Cache and reuse task outputs across builds
 * - Warn about configuration cache incompatibilities without blocking the build
 *
 * Expected savings: 2-3 minutes per build
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const GRADLE_PROPERTIES_PATH = path.join(WORKSPACE_ROOT, 'android', 'gradle.properties');

describe('Gradle Configuration Cache Settings', () => {
    const androidDirExists = fs.existsSync(path.join(WORKSPACE_ROOT, 'android'));
    let gradleProperties: string;

    beforeAll(() => {
        if (androidDirExists) {
            gradleProperties = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf-8');
        }
    });

    describe('Unit: Configuration cache property', () => {
        it('should have org.gradle.configuration-cache=true', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Gradle configuration cache stores the result of the configuration phase.
            // On subsequent builds with no build script changes, Gradle can skip
            // re-evaluating all build.gradle files entirely.
            //
            // Without this: Gradle parses and evaluates ALL build scripts every time (~30-60s)
            // With this: Gradle reuses cached configuration result (~0s)
            expect(gradleProperties).toContain('org.gradle.configuration-cache=true');
        });

        it('should have org.gradle.configuration-cache.problems=warn', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Some third-party plugins may not be fully configuration-cache compatible.
            // Setting problems=warn allows the build to proceed while logging warnings.
            //
            // Default behavior (without this): Gradle FAILS on any incompatibility
            // With warn: Gradle logs the issue but continues the build
            //
            // This is critical for React Native projects where plugins like
            // react-native-gradle-plugin may have minor incompatibilities.
            expect(gradleProperties).toContain('org.gradle.configuration-cache.problems=warn');
        });

        it('should have org.gradle.caching=true', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Gradle build cache stores task outputs and reuses them when inputs haven't changed.
            // This complements configuration cache:
            // - Configuration cache: skips build script evaluation
            // - Build cache: skips task execution when inputs match
            //
            // Together they provide maximum build speed improvement.
            expect(gradleProperties).toContain('org.gradle.caching=true');
        });
    });

    describe('Unit: Property value correctness', () => {
        it('should not have configuration-cache set to false', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            const lines = gradleProperties.split('\n');
            const configCacheLine = lines.find(
                (line) => line.startsWith('org.gradle.configuration-cache=') && !line.startsWith('#')
            );

            expect(configCacheLine).toBeDefined();
            expect(configCacheLine).not.toBe('org.gradle.configuration-cache=false');
        });

        it('should not have configuration-cache.problems set to fail', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Setting problems=fail would cause builds to break on any
            // configuration cache incompatibility, which is too strict
            // for a React Native project with many third-party plugins.
            const lines = gradleProperties.split('\n');
            const problemsLine = lines.find(
                (line) => line.startsWith('org.gradle.configuration-cache.problems=') && !line.startsWith('#')
            );

            expect(problemsLine).toBeDefined();
            expect(problemsLine).not.toBe('org.gradle.configuration-cache.problems=fail');
        });

        it('should not have caching set to false', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            const lines = gradleProperties.split('\n');
            const cachingLine = lines.find(
                (line) => line.startsWith('org.gradle.caching=') && !line.startsWith('#')
            );

            expect(cachingLine).toBeDefined();
            expect(cachingLine).not.toBe('org.gradle.caching=false');
        });
    });

    describe('Integration: Configuration cache works with existing settings', () => {
        it('should coexist with parallel builds setting', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Configuration cache + parallel builds are complementary:
            // - Parallel: runs independent tasks concurrently
            // - Config cache: skips re-evaluation of build scripts
            // Both should be enabled simultaneously.
            expect(gradleProperties).toContain('org.gradle.parallel=true');
            expect(gradleProperties).toContain('org.gradle.configuration-cache=true');
        });

        it('should coexist with existing JVM args', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Configuration cache settings are separate from JVM args.
            // Both must be present without conflict.
            expect(gradleProperties).toMatch(/org\.gradle\.jvmargs=/);
            expect(gradleProperties).toContain('org.gradle.configuration-cache=true');
        });

        it('should not duplicate any configuration cache settings', () => {
            if (!androidDirExists) {
                console.log('⚠️  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Ensure each setting appears exactly once (no duplicates)
            const configCacheMatches = gradleProperties.match(/^org\.gradle\.configuration-cache=.+$/gm);
            const problemsMatches = gradleProperties.match(/^org\.gradle\.configuration-cache\.problems=.+$/gm);
            const cachingMatches = gradleProperties.match(/^org\.gradle\.caching=.+$/gm);

            expect(configCacheMatches).toHaveLength(1);
            expect(problemsMatches).toHaveLength(1);
            expect(cachingMatches).toHaveLength(1);
        });
    });

    describe('E2E: Workflow uses configuration cache', () => {
        let workflowContent: string;

        beforeAll(() => {
            workflowContent = fs.readFileSync(
                path.join(WORKSPACE_ROOT, '.github', 'workflows', 'build-android.yml'),
                'utf-8'
            );
        });

        it('should pass --configuration-cache flag to gradlew command', () => {
            // The gradlew command should explicitly enable configuration cache
            // via the CLI flag, even though it's also set in gradle.properties.
            // This provides defense-in-depth: if gradle.properties is regenerated
            // by expo prebuild, the CLI flag still ensures config cache is used.
            expect(workflowContent).toContain('--configuration-cache');
        });

        it('should use setup-gradle action which supports configuration cache', () => {
            // gradle/actions/setup-gradle@v4 automatically manages
            // the configuration cache directory alongside other caches.
            expect(workflowContent).toContain('gradle/actions/setup-gradle');
        });

        it('should have cache-read-only for non-master branches', () => {
            // Non-master branches should not pollute the configuration cache.
            // This prevents cache thrashing from feature branch variations.
            expect(workflowContent).toMatch(/cache-read-only/);
        });
    });
});
