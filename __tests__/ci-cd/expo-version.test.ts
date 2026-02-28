/**
 * Tests for iOS Expo version pinning in CI/CD workflow
 *
 * These tests validate that the iOS build workflow pins the Expo CLI version
 * to match the project's package.json dependency, rather than using 'latest'.
 *
 * WHY: Using `expo-version: latest` in CI causes:
 * 1. Non-deterministic builds (different Expo versions across runs)
 * 2. Unexpected breaking changes when Expo releases a new major version
 * 3. ~1 minute wasted on version resolution per build
 * 4. Potential incompatibilities between Expo CLI and SDK versions
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOW_PATH = path.resolve(
    __dirname,
    '../../.github/workflows/build-ios.yml'
);

const PACKAGE_JSON_PATH = path.resolve(__dirname, '../../package.json');

describe('iOS Expo version pinning', () => {
    let workflowContent: string;
    let packageJson: { dependencies: Record<string, string> };

    beforeAll(() => {
        workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
        packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    });

    describe('workflow file validity', () => {
        it('should have a build-ios.yml workflow file', () => {
            expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
        });

        it('should contain expo-github-action setup step', () => {
            expect(workflowContent).toContain('expo/expo-github-action');
        });
    });

    describe('version pinning', () => {
        it('should NOT use expo-version: latest', () => {
            // Using 'latest' causes non-deterministic builds and version resolution delays
            const latestPattern = /expo-version:\s*latest/;
            expect(workflowContent).not.toMatch(latestPattern);
        });

        it('should pin expo-version to a specific semver version', () => {
            // Extract the expo-version value from the workflow
            const versionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\S+?)['"]?\s*$/m
            );
            expect(versionMatch).not.toBeNull();

            const version = versionMatch![1];
            // Should be a valid semver (e.g., "54.0.33", not "latest" or "latest-stable")
            const semverPattern = /^\d+\.\d+\.\d+$/;
            expect(version).toMatch(semverPattern);
        });

        it('should pin expo-version that is compatible with package.json expo SDK', () => {
            // Extract expo version from package.json
            const expoDepVersion = packageJson.dependencies['expo'];
            expect(expoDepVersion).toBeDefined();

            // Extract major version from package.json (e.g., "~54.0.32" -> "54")
            const depMajorMatch = expoDepVersion.match(/(\d+)\./);
            expect(depMajorMatch).not.toBeNull();
            const depMajor = depMajorMatch![1];

            // Extract pinned version from workflow
            const workflowVersionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\S+?)['"]?\s*$/m
            );
            expect(workflowVersionMatch).not.toBeNull();
            const pinnedVersion = workflowVersionMatch![1];

            // Major versions should match
            const pinnedMajorMatch = pinnedVersion.match(/^(\d+)\./);
            expect(pinnedMajorMatch).not.toBeNull();
            expect(pinnedMajorMatch![1]).toBe(depMajor);
        });
    });

    describe('version consistency', () => {
        it('should use the same expo major version as package.json', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            // Remove range prefix (~, ^, >=, etc.)
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            const workflowVersionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\d+\.\d+\.\d+)['"]?\s*$/m
            );
            expect(workflowVersionMatch).not.toBeNull();

            const pinnedParts = workflowVersionMatch![1].split('.');

            // Major version must match exactly
            expect(pinnedParts[0]).toBe(depParts[0]);
        });

        it('should use the same expo minor version as package.json', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            const workflowVersionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\d+\.\d+\.\d+)['"]?\s*$/m
            );
            expect(workflowVersionMatch).not.toBeNull();

            const pinnedParts = workflowVersionMatch![1].split('.');

            // Minor version must match exactly
            expect(pinnedParts[1]).toBe(depParts[1]);
        });

        it('should use a patch version >= package.json patch version', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            const workflowVersionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\d+\.\d+\.\d+)['"]?\s*$/m
            );
            expect(workflowVersionMatch).not.toBeNull();

            const pinnedParts = workflowVersionMatch![1].split('.');

            // Patch version should be >= the package.json patch
            expect(Number(pinnedParts[2])).toBeGreaterThanOrEqual(
                Number(depParts[2])
            );
        });
    });

    describe('no dynamic version resolution', () => {
        it('should not use version keywords that trigger resolution', () => {
            // These all cause CI to resolve the version at runtime, wasting time
            const dynamicPatterns = [
                /expo-version:\s*latest\b/,
                /expo-version:\s*latest-stable\b/,
                /expo-version:\s*next\b/,
                /expo-version:\s*canary\b/,
                /expo-version:\s*beta\b/,
            ];

            for (const pattern of dynamicPatterns) {
                expect(workflowContent).not.toMatch(pattern);
            }
        });

        it('should not use version ranges', () => {
            // Ranges like ^54.0.0 or ~54.0.0 still need resolution
            const versionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\S+?)['"]?\s*$/m
            );
            expect(versionMatch).not.toBeNull();

            const version = versionMatch![1];
            expect(version).not.toMatch(/^[~^>=<]/);
        });
    });
});
