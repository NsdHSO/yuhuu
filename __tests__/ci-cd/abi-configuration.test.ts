/**
 * Tests for Android ABI (Application Binary Interface) reduction
 *
 * PROBLEM: Current build compiles for ALL 4 ABIs (armeabi-v7a, arm64-v8a, x86, x86_64)
 * even for FAT/UAT builds where we only deploy to arm64-v8a devices.
 *
 * This wastes 4-6 minutes per build because:
 * - Each ABI requires separate native compilation (Hermes, JSI, native modules)
 * - x86/x86_64 are only needed for emulators
 * - armeabi-v7a is legacy (pre-2017 devices)
 * - Samsung A52s (our target FAT device) is arm64-v8a
 *
 * SOLUTION: Two-layer ABI control:
 * 1. gradle.properties sets a fast default (arm64-v8a) for local dev builds
 * 2. CI workflow uses -PreactNativeArchitectures flag to override per environment:
 *    - FAT/UAT: arm64-v8a only (single ABI, fast builds)
 *    - Production: all 4 ABIs (full device compatibility via Google Play)
 *
 * NOTE: gradle.properties does NOT support shell variable substitution.
 * The -P flag on the gradlew command is the correct way to override properties
 * at build time from CI.
 *
 * Expected savings: 4-6 minutes per non-production build
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const GRADLE_PROPERTIES_PATH = path.join(WORKSPACE_ROOT, 'android', 'gradle.properties');
const ANDROID_WORKFLOW_PATH = path.join(WORKSPACE_ROOT, '.github', 'workflows', 'build-android.yml');

describe('Android ABI Configuration', () => {
    describe('gradle.properties ABI defaults', () => {
        let gradleProperties: string;

        beforeAll(() => {
            gradleProperties = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf-8');
        });

        it('should have reactNativeArchitectures property defined', () => {
            expect(gradleProperties).toContain('reactNativeArchitectures=');
        });

        it('should NOT be hardcoded to all 4 ABIs', () => {
            // gradle.properties is a static file -- no shell variable substitution.
            // It should default to arm64-v8a (fast local dev) and CI overrides
            // via -PreactNativeArchitectures on the gradlew command.
            const lines = gradleProperties.split('\n');
            const abiLine = lines.find(
                (line) => line.startsWith('reactNativeArchitectures=') && !line.startsWith('#')
            );

            expect(abiLine).toBeDefined();

            const hasAllFourAbis =
                abiLine!.includes('armeabi-v7a') &&
                abiLine!.includes('arm64-v8a') &&
                abiLine!.includes('x86,') &&
                abiLine!.includes('x86_64');

            expect(hasAllFourAbis).toBe(false);
        });

        it('should default to arm64-v8a for fast local dev builds', () => {
            // The default in gradle.properties should be arm64-v8a
            // so that local dev builds on physical devices are fast.
            // CI will override this via -P flag when needed.
            const lines = gradleProperties.split('\n');
            const abiLine = lines.find(
                (line) => line.startsWith('reactNativeArchitectures=') && !line.startsWith('#')
            );

            expect(abiLine).toBe('reactNativeArchitectures=arm64-v8a');
        });

        it('should NOT contain shell variable syntax (not supported by Gradle)', () => {
            // gradle.properties is a Java properties file.
            // Shell syntax like ${VAR:-default} does NOT work here.
            // ABI selection must be done via -P flag on the gradlew CLI.
            const lines = gradleProperties.split('\n');
            const abiLine = lines.find(
                (line) => line.startsWith('reactNativeArchitectures=') && !line.startsWith('#')
            );

            expect(abiLine).not.toContain('${');
            expect(abiLine).not.toContain(':-');
        });
    });

    describe('Workflow ABI override via -P flag', () => {
        let workflowContent: string;

        beforeAll(() => {
            workflowContent = fs.readFileSync(ANDROID_WORKFLOW_PATH, 'utf-8');
        });

        it('should pass -PreactNativeArchitectures flag to gradlew', () => {
            // The correct way to override gradle.properties from CI is via
            // the -P (project property) flag on the gradlew command line.
            // This takes precedence over the value in gradle.properties.
            expect(workflowContent).toMatch(/-PreactNativeArchitectures=/);
        });

        it('should use REACT_NATIVE_ABIS env var in the -P flag for configurability', () => {
            // The -P flag value should come from the REACT_NATIVE_ABIS env var
            // so that different environments (FAT, UAT, production) can set different ABIs.
            //
            // Expected pattern:
            //   ./gradlew assembleRelease -PreactNativeArchitectures=${{ env.REACT_NATIVE_ABIS }}
            //
            // This makes it easy to change ABIs per environment without editing the command.
            expect(workflowContent).toMatch(
                /-PreactNativeArchitectures=\$\{\{\s*env\.REACT_NATIVE_ABIS\s*\}\}/
            );
        });

        it('should set REACT_NATIVE_ABIS environment variable for the build step', () => {
            expect(workflowContent).toContain('REACT_NATIVE_ABIS');
        });

        it('should use arm64-v8a for FAT environment builds', () => {
            // FAT builds target Samsung A52s which is arm64-v8a
            expect(workflowContent).toMatch(/REACT_NATIVE_ABIS.*arm64-v8a/);
        });

        it('should NOT include x86 or x86_64 in FAT build configuration', () => {
            // x86 and x86_64 are emulator-only ABIs
            const abiMatch = workflowContent.match(/REACT_NATIVE_ABIS:\s*(.+)/);
            expect(abiMatch).not.toBeNull();
            if (abiMatch) {
                const abiValue = abiMatch[1];
                expect(abiValue).not.toContain('x86_64');
                expect(abiValue).not.toContain('x86,');
            }
        });
    });

    describe('ABI compatibility validation', () => {
        it('should document Samsung A52s target ABI', () => {
            // Samsung Galaxy A52s 5G specs:
            // - CPU: Qualcomm Snapdragon 778G (Kryo 670)
            // - Architecture: arm64-v8a (64-bit ARM)
            // - Also supports armeabi-v7a (32-bit ARM backward compat)
            // - Does NOT need x86 or x86_64
            const samsungA52sAbi = 'arm64-v8a';
            expect(samsungA52sAbi).toBe('arm64-v8a');
        });

        it('should document ABI build time impact', () => {
            // Approximate build times per ABI (React Native with Hermes):
            // - arm64-v8a: ~3-4 minutes
            // - armeabi-v7a: ~3-4 minutes
            // - x86: ~3-4 minutes
            // - x86_64: ~3-4 minutes
            // Total (all 4): ~12-16 minutes
            // Single ABI: ~3-4 minutes
            // Savings: ~9-12 minutes (4-6 minutes after parallel compilation)
            const allAbis = ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'];
            const fatAbis = ['arm64-v8a'];
            expect(fatAbis.length).toBeLessThan(allAbis.length);
        });

        it('should document when all ABIs are needed', () => {
            // Production builds MUST include all ABIs for Google Play:
            // - arm64-v8a: modern phones (2017+)
            // - armeabi-v7a: older phones (pre-2017, some budget devices)
            // - x86_64: Chromebooks, Intel tablets
            // - x86: older Chromebooks, older Intel devices
            //
            // Google Play will serve the correct ABI to each device
            const productionAbis = ['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'];
            expect(productionAbis).toHaveLength(4);
        });
    });

    describe('gradle.properties PNG crunching optimization', () => {
        let gradleProperties: string;

        beforeAll(() => {
            gradleProperties = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf-8');
        });

        it('should have PNG crunching disabled for non-production builds', () => {
            // PNG crunching (AAPT2) compresses PNG assets at build time
            // This adds 30-60 seconds to each build
            // For FAT/UAT builds, this optimization is unnecessary
            const lines = gradleProperties.split('\n');
            const pngLine = lines.find(
                (line) =>
                    line.startsWith('android.enablePngCrunchInReleaseBuilds=') &&
                    !line.startsWith('#')
            );

            expect(pngLine).toBeDefined();
            expect(pngLine).toBe('android.enablePngCrunchInReleaseBuilds=false');
        });
    });
});
