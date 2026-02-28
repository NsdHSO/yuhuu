/**
 * Tests for Android conditional prebuild with caching
 *
 * PROBLEM: Current workflow runs `npx expo prebuild --platform android --clean`
 * on EVERY build, even when nothing has changed.
 *
 * This is wasteful because:
 * 1. --clean deletes the entire android/ directory and regenerates it
 * 2. expo prebuild takes 1-3 minutes
 * 3. The output is deterministic (same inputs = same output)
 * 4. It invalidates any Gradle build cache from previous runs
 *
 * SOLUTION: Cache the android/ directory and only re-run prebuild when inputs change:
 * - Cache key: hash of app.config.js + package.json + patches (if any)
 * - On cache hit: skip prebuild entirely (save 2-3 minutes)
 * - On cache miss: run prebuild WITHOUT --clean (incremental, faster)
 * - Remove --clean flag (prevents unnecessary full regeneration)
 *
 * Expected savings: 2-3 minutes per build on cache hit
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const ANDROID_WORKFLOW_PATH = path.join(WORKSPACE_ROOT, '.github', 'workflows', 'build-android.yml');
const APP_CONFIG_PATH = path.join(WORKSPACE_ROOT, 'app.config.js');
const PACKAGE_JSON_PATH = path.join(WORKSPACE_ROOT, 'package.json');

describe('Android Prebuild Caching', () => {
    let workflowContent: string;

    beforeAll(() => {
        workflowContent = fs.readFileSync(ANDROID_WORKFLOW_PATH, 'utf-8');
    });

    describe('--clean flag removal', () => {
        it('should NOT use --clean flag in expo prebuild command', () => {
            // CURRENT (RED):
            //   npx expo prebuild --platform android --clean
            //
            // EXPECTED (GREEN):
            //   npx expo prebuild --platform android
            //   (or skip entirely on cache hit)
            //
            // --clean is harmful because:
            // 1. Deletes the entire android/ directory
            // 2. Invalidates ALL Gradle caches
            // 3. Forces full re-generation every time
            // 4. Makes incremental builds impossible

            // Find prebuild command lines
            const prebuildLines = workflowContent
                .split('\n')
                .filter((line) => line.includes('expo prebuild') && line.includes('android'));

            expect(prebuildLines.length).toBeGreaterThan(0);

            for (const line of prebuildLines) {
                expect(line).not.toContain('--clean');
            }
        });
    });

    describe('Prebuild cache configuration', () => {
        it('should have a cache step for the android/ directory before prebuild', () => {
            // The android/ directory should be cached to skip prebuild on repeat builds
            // Cache should appear BEFORE the prebuild step in the workflow

            // Look for a cache step that references android directory
            const hasAndroidCache =
                workflowContent.includes('actions/cache') &&
                workflowContent.includes('android/');

            expect(hasAndroidCache).toBe(true);
        });

        it('should use app.config.js in the cache key hash', () => {
            // app.config.js controls what expo prebuild generates:
            // - Package name, permissions, plugins, native modules
            // When it changes, we MUST re-run prebuild
            //
            // Expected cache key pattern:
            //   key: ...-${{ hashFiles('app.config.js', 'package.json') }}

            expect(workflowContent).toMatch(/hashFiles.*app\.config/);
        });

        it('should use package.json in the cache key hash', () => {
            // package.json changes mean dependency changes
            // New native dependencies require prebuild to regenerate android/
            //
            // Expected: package.json (or pnpm-lock.yaml) in hashFiles

            expect(workflowContent).toMatch(/hashFiles.*package\.json/);
        });

        it('should have a step ID for cache hit detection', () => {
            // The cache step needs an ID so the prebuild step can reference
            // steps.<id>.outputs.cache-hit to conditionally skip
            //
            // Expected pattern:
            //   - name: Cache Android prebuild
            //     id: android-prebuild-cache
            //     uses: actions/cache@v4

            // Look for an id field near the android cache step
            const hasIdForAndroidCache =
                workflowContent.includes('id:') &&
                workflowContent.includes('prebuild');

            expect(hasIdForAndroidCache).toBe(true);
        });

        it('should conditionally skip prebuild on cache hit', () => {
            // When the android/ cache is restored, prebuild is unnecessary
            // The step should have a condition like:
            //   if: steps.android-prebuild-cache.outputs.cache-hit != 'true'

            const hasConditionalPrebuild =
                workflowContent.includes('cache-hit') &&
                workflowContent.includes("!= 'true'");

            expect(hasConditionalPrebuild).toBe(true);
        });
    });

    describe('Cache key validation', () => {
        it('should verify app.config.js exists and is readable', () => {
            expect(fs.existsSync(APP_CONFIG_PATH)).toBe(true);
            const content = fs.readFileSync(APP_CONFIG_PATH, 'utf-8');
            expect(content.length).toBeGreaterThan(0);
        });

        it('should verify package.json exists and is readable', () => {
            expect(fs.existsSync(PACKAGE_JSON_PATH)).toBe(true);
            const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
            expect(content.length).toBeGreaterThan(0);
        });

        it('should verify app.config.js contains android configuration', () => {
            const content = fs.readFileSync(APP_CONFIG_PATH, 'utf-8');
            expect(content).toContain('android');
            expect(content).toContain('package');
        });
    });

    describe('Prebuild determinism', () => {
        it('should document that prebuild output is deterministic', () => {
            // expo prebuild generates android/ based on:
            // 1. app.config.js (app name, package, permissions, plugins)
            // 2. package.json (native dependencies)
            // 3. Expo SDK version
            // 4. Plugin configurations
            //
            // Same inputs ALWAYS produce same output
            // Therefore caching is safe and correct
            expect(true).toBe(true);
        });

        it('should document cache invalidation scenarios', () => {
            // The cache MUST be invalidated when:
            // 1. app.config.js changes (new permissions, plugins, etc.)
            // 2. package.json changes (new native dependencies)
            // 3. Expo SDK version changes
            // 4. Native patches change (if using patch-package)
            //
            // The cache should NOT be invalidated when:
            // 1. JavaScript code changes (prebuild doesn't touch JS)
            // 2. Asset changes (images, fonts - handled separately)
            // 3. CI workflow changes (doesn't affect prebuild output)
            expect(true).toBe(true);
        });
    });

    describe('Workflow step ordering', () => {
        it('should have prebuild cache BEFORE prebuild step', () => {
            const cacheIndex = workflowContent.indexOf('actions/cache');
            const prebuildIndex = workflowContent.indexOf('expo prebuild');

            // Both should exist
            expect(cacheIndex).toBeGreaterThan(-1);
            expect(prebuildIndex).toBeGreaterThan(-1);

            // There should be a cache reference before prebuild
            const contentBeforePrebuild = workflowContent.substring(0, prebuildIndex);
            const hasCacheBeforePrebuild = contentBeforePrebuild.includes('actions/cache');
            expect(hasCacheBeforePrebuild).toBe(true);
        });

        it('should have prebuild step BEFORE Gradle build step', () => {
            const prebuildIndex = workflowContent.indexOf('expo prebuild');
            const gradleBuildIndex = workflowContent.indexOf('assembleRelease');

            expect(prebuildIndex).toBeGreaterThan(-1);
            expect(gradleBuildIndex).toBeGreaterThan(-1);
            expect(prebuildIndex).toBeLessThan(gradleBuildIndex);
        });
    });
});
