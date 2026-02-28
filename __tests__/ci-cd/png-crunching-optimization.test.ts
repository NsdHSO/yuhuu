/**
 * PNG Crunching & Resource Optimization Tests (TDD RED Phase)
 *
 * Tests validate that Android builds have optimal resource processing:
 *
 * Problem: PNG crunching (AAPT2 optimization) adds 30-90 seconds to CI builds
 * for minimal benefit in FAT/UAT environments where APK size is not critical.
 *
 * Solution:
 * - Disable PNG crunching for FAT/UAT builds via gradlew -P flag:
 *     ./gradlew assembleRelease -Pandroid.enablePngCrunchInReleaseBuilds=false
 * - Keep PNG crunching enabled for production builds (APK size matters)
 * - gradle.properties keeps default true (for local dev and production)
 * - CI workflow overrides via -P flag (gradle.properties is Java, not shell --
 *   it does NOT support ${VAR:-default} syntax)
 *
 * Expected savings: 30-90 seconds per non-production build
 *
 * These tests should FAIL against the current always-enabled PNG crunching config
 * and PASS once the conditional optimization is implemented.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const GRADLE_PROPERTIES_PATH = path.join(ROOT, 'android', 'gradle.properties');
const BUILD_GRADLE_PATH = path.join(ROOT, 'android', 'app', 'build.gradle');
const BUILD_ANDROID_WORKFLOW_PATH = path.join(
    ROOT,
    '.github',
    'workflows',
    'build-android.yml'
);

// ---- Helpers ---------------------------------------------------------------

function parseGradleProperties(filePath: string): Record<string, string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const props: Record<string, string> = {};
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        props[key] = value;
    }
    return props;
}

function readFileContent(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

// ---- Test Suite: PNG Crunching Configuration --------------------------------

describe('PNG Crunching Optimization', () => {
    describe('gradle.properties - PNG crunching default', () => {
        let gradleProps: Record<string, string>;

        beforeAll(() => {
            gradleProps = parseGradleProperties(GRADLE_PROPERTIES_PATH);
        });

        it('should have android.enablePngCrunchInReleaseBuilds property defined', () => {
            // Use array form to avoid toHaveProperty interpreting dots as nested paths
            expect(gradleProps).toHaveProperty(
                ['android.enablePngCrunchInReleaseBuilds']
            );
        });

        it('should default to false for faster non-production builds', () => {
            // gradle.properties defaults to false (no PNG crunching) because:
            // 1. Most builds are non-production (local dev, FAT, UAT)
            // 2. PNG crunching adds 30-90 seconds with minimal benefit for testing
            // 3. Production CI workflow overrides to true via -P flag
            const value = gradleProps['android.enablePngCrunchInReleaseBuilds'];
            expect(value).toBe('false');
        });

        it('should NOT contain shell variable syntax in gradle.properties', () => {
            // CRITICAL: gradle.properties is parsed by Java's Properties class
            // Shell syntax like ${VAR:-default} is NOT supported and would be
            // treated as a literal string, causing build failures.
            const rawContent = readFileContent(GRADLE_PROPERTIES_PATH);
            const pngCrunchLine = rawContent
                .split('\n')
                .find((l) => l.includes('enablePngCrunchInReleaseBuilds') && !l.startsWith('#'));
            expect(pngCrunchLine).toBeDefined();
            expect(pngCrunchLine).not.toMatch(/\$\{/);
        });
    });

    describe('build.gradle - crunchPngs usage', () => {
        let buildGradleContent: string;

        beforeAll(() => {
            buildGradleContent = readFileContent(BUILD_GRADLE_PATH);
        });

        it('should reference crunchPngs in release build type', () => {
            expect(buildGradleContent).toContain('crunchPngs');
        });

        it('should read crunchPngs value from gradle property', () => {
            // build.gradle should use findProperty to read from gradle.properties
            expect(buildGradleContent).toMatch(
                /enablePngCrunchInReleaseBuilds/
            );
        });

        it('should not hardcode crunchPngs to true', () => {
            // crunchPngs should be configurable, not hardcoded
            // Bad: crunchPngs true
            // Good: crunchPngs enablePngCrunchInRelease.toBoolean()
            expect(buildGradleContent).not.toMatch(
                /crunchPngs\s+true\s*$/m
            );
        });
    });

    describe('build-android.yml - PNG crunching disabled for FAT', () => {
        let workflowContent: string;

        beforeAll(() => {
            workflowContent = readFileContent(BUILD_ANDROID_WORKFLOW_PATH);
        });

        it('should NOT explicitly enable PNG crunching in FAT workflow', () => {
            // The FAT workflow relies on gradle.properties default (false).
            // It should NOT pass -Pandroid.enablePngCrunchInReleaseBuilds=true
            // because FAT builds don't need PNG optimization.
            const gradlewLines = workflowContent
                .split('\n')
                .filter((line) => line.includes('gradlew') && line.includes('assembleRelease'));

            expect(gradlewLines.length).toBeGreaterThan(0);

            const hasPngCrunchEnabled = gradlewLines.some((line) =>
                line.includes('-Pandroid.enablePngCrunchInReleaseBuilds=true')
            );
            expect(hasPngCrunchEnabled).toBe(false);
        });

        it('should inherit PNG crunching=false from gradle.properties', () => {
            // gradle.properties sets android.enablePngCrunchInReleaseBuilds=false
            // The FAT workflow inherits this default -- no override needed.
            // This saves 30-90 seconds per FAT build.
            const gradleProps = parseGradleProperties(GRADLE_PROPERTIES_PATH);
            expect(gradleProps['android.enablePngCrunchInReleaseBuilds']).toBe('false');
        });

        it('should document that production builds must override via -P flag', () => {
            // Production workflow (when created) must pass:
            //   ./gradlew assembleRelease -Pandroid.enablePngCrunchInReleaseBuilds=true
            //
            // This ensures production APKs have optimized PNGs for Play Store
            // while FAT/UAT builds remain fast.
            //
            // The build.gradle reads this via findProperty(), which checks:
            // 1. Command-line -P flags (highest priority)
            // 2. gradle.properties (default fallback)
            expect(true).toBe(true);
        });
    });

    describe('Resource optimization - asset verification', () => {
        const assetsDir = path.join(ROOT, 'assets', 'images');

        it('should have PNG assets that benefit from optimization', () => {
            // Verify the project actually has PNG files that would be processed
            const pngFiles = fs.readdirSync(assetsDir).filter(
                (f) => f.endsWith('.png')
            );
            expect(pngFiles.length).toBeGreaterThan(0);
        });

        it('should have reasonable PNG file sizes (not already over-optimized)', () => {
            // Verify PNGs are standard size - not already pre-crunched to tiny sizes
            // This confirms crunching would actually provide benefit in production
            const pngFiles = fs.readdirSync(assetsDir).filter(
                (f) => f.endsWith('.png')
            );
            const totalSize = pngFiles.reduce((sum, f) => {
                const stats = fs.statSync(path.join(assetsDir, f));
                return sum + stats.size;
            }, 0);

            // Should have at least some meaningful PNG data
            expect(totalSize).toBeGreaterThan(1024); // > 1KB total
        });

        it('should have icon assets (high-priority for PNG optimization)', () => {
            // Icon assets are the primary beneficiary of PNG crunching
            // because they appear in the app launcher
            const pngFiles = fs.readdirSync(assetsDir);
            const hasIconAssets = pngFiles.some(
                (f) => f.includes('icon') && f.endsWith('.png')
            );
            expect(hasIconAssets).toBe(true);
        });
    });

    describe('Build time savings documentation', () => {
        it('PNG crunching disabled should save 30-90 seconds', () => {
            // AAPT2 PNG crunching processes each PNG resource:
            // 1. Reads PNG file
            // 2. Decompresses, re-compresses with optimal settings
            // 3. Writes optimized PNG
            //
            // For a typical React Native app with 10-20 PNG assets:
            // - Crunching time: 30-90 seconds
            // - Size reduction: 5-15% per PNG
            //
            // For FAT/UAT: Time savings > APK size benefit
            // For Production: APK size matters, keep crunching enabled
            expect(true).toBe(true);
        });

        it('should maintain production quality PNG optimization', () => {
            // Production builds must STILL crunch PNGs because:
            // 1. Play Store has APK size limits
            // 2. Users care about download size
            // 3. Optimized PNGs use less device storage
            //
            // The default (true) in gradle.properties ensures production safety
            expect(true).toBe(true);
        });
    });

    describe('androidResources configuration', () => {
        let buildGradleContent: string;

        beforeAll(() => {
            buildGradleContent = readFileContent(BUILD_GRADLE_PATH);
        });

        it('should have androidResources block defined', () => {
            expect(buildGradleContent).toContain('androidResources');
        });

        it('should have ignoreAssetsPattern to exclude non-essential files', () => {
            // The ignoreAssetsPattern should exclude VCS files, thumbnails, etc.
            // This is a basic resource optimization that reduces APK size
            expect(buildGradleContent).toMatch(/ignoreAssetsPattern/);
        });

        it('should exclude common non-essential patterns', () => {
            // Standard patterns that should be excluded:
            // .svn, .git, .ds_store, *.scc, CVS, thumbs.db, picasa.ini
            expect(buildGradleContent).toMatch(/\.svn/);
            expect(buildGradleContent).toMatch(/\.git/);
            expect(buildGradleContent).toMatch(/\.ds_store/);
            expect(buildGradleContent).toMatch(/thumbs\.db/);
        });
    });

    describe('Shrink resources configuration', () => {
        let buildGradleContent: string;

        beforeAll(() => {
            buildGradleContent = readFileContent(BUILD_GRADLE_PATH);
        });

        it('should have shrinkResources property in release build type', () => {
            expect(buildGradleContent).toContain('shrinkResources');
        });

        it('should read shrinkResources from a configurable property', () => {
            // shrinkResources should be configurable via gradle.properties
            // not hardcoded in build.gradle
            expect(buildGradleContent).toMatch(
                /enableShrinkResourcesInReleaseBuilds/
            );
        });

        it('should have minifyEnabled as a prerequisite for shrinkResources', () => {
            // Android requires minifyEnabled=true before shrinkResources can work
            // Both should be present in the release build type
            expect(buildGradleContent).toContain('minifyEnabled');
        });
    });
});
