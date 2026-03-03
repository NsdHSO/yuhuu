/**
 * Tests for iOS Expo version configuration in CI/CD workflow
 *
 * These tests validate that the iOS build workflow uses `expo-version: latest`
 * with expo-github-action@v8, which automatically syncs with package.json.
 *
 * WHY: expo-github-action@v8 with `expo-version: latest` is recommended because:
 * 1. Automatically uses the expo version from package.json (no manual sync needed)
 * 2. Avoids deprecated expo-cli package resolution errors
 * 3. Self-healing when package.json updates
 * 4. Deterministic builds (package.json controls the version, not CI)
 *
 * The actual version pinning happens in package.json with semver format (e.g., "~54.0.32")
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
        it('should use expo-version: latest for expo-github-action@v8', () => {
            // expo-github-action@v8 with 'latest' automatically uses package.json version
            // This is the recommended approach to avoid deprecated expo-cli resolution
            const latestPattern = /expo-version:\s*latest/;
            expect(workflowContent).toMatch(latestPattern);
        });

        it('should have expo pinned in package.json with semver range', () => {
            // The actual version control happens in package.json
            const expoDepVersion = packageJson.dependencies['expo'];
            expect(expoDepVersion).toBeDefined();

            // Should use semver range format (e.g., "~54.0.32" or "^54.0.0")
            const semverRangePattern = /^[~^]?\d+\.\d+\.\d+$/;
            expect(expoDepVersion).toMatch(semverRangePattern);
        });

        it('should use a stable expo version in package.json', () => {
            // Ensure package.json doesn't use unstable versions
            const expoDepVersion = packageJson.dependencies['expo'];
            expect(expoDepVersion).toBeDefined();

            // Should NOT contain keywords like "next", "canary", "beta", "alpha"
            expect(expoDepVersion).not.toContain('next');
            expect(expoDepVersion).not.toContain('canary');
            expect(expoDepVersion).not.toContain('beta');
            expect(expoDepVersion).not.toContain('alpha');
        });
    });

    describe('package.json version format', () => {
        it('should have a valid major version number', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            // Major version should be a number >= 0
            const majorVersion = Number(depParts[0]);
            expect(majorVersion).toBeGreaterThanOrEqual(0);
            expect(Number.isNaN(majorVersion)).toBe(false);
        });

        it('should have a valid minor version number', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            // Minor version should be a number >= 0
            const minorVersion = Number(depParts[1]);
            expect(minorVersion).toBeGreaterThanOrEqual(0);
            expect(Number.isNaN(minorVersion)).toBe(false);
        });

        it('should have a valid patch version number', () => {
            const expoDepVersion = packageJson.dependencies['expo'];
            const cleanVersion = expoDepVersion.replace(/^[~^>=<]+/, '');
            const depParts = cleanVersion.split('.');

            // Patch version should be a number >= 0
            const patchVersion = Number(depParts[2]);
            expect(patchVersion).toBeGreaterThanOrEqual(0);
            expect(Number.isNaN(patchVersion)).toBe(false);
        });

        it('should use tilde (~) or caret (^) for controlled updates', () => {
            const expoDepVersion = packageJson.dependencies['expo'];

            // Should start with ~ or ^ for semantic versioning range
            const hasSemanticPrefix = /^[~^]/.test(expoDepVersion);
            expect(hasSemanticPrefix).toBe(true);
        });
    });

    describe('workflow version configuration', () => {
        it('should use "latest" in workflow (syncs with package.json)', () => {
            // expo-github-action@v8 with 'latest' is the recommended approach
            const versionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\S+?)['"]?\s*$/m
            );
            expect(versionMatch).not.toBeNull();

            const version = versionMatch![1];
            expect(version).toBe('latest');
        });

        it('should not use unstable version keywords in workflow', () => {
            // 'latest' is allowed, but unstable versions should be avoided
            const unstablePatterns = [
                /expo-version:\s*next\b/,
                /expo-version:\s*canary\b/,
                /expo-version:\s*beta\b/,
                /expo-version:\s*alpha\b/,
            ];

            for (const pattern of unstablePatterns) {
                expect(workflowContent).not.toMatch(pattern);
            }
        });

        it('should not use version ranges in workflow', () => {
            // Version ranges (^, ~) should be in package.json, not workflow
            const versionMatch = workflowContent.match(
                /expo-version:\s*['"]?(\S+?)['"]?\s*$/m
            );
            expect(versionMatch).not.toBeNull();

            const version = versionMatch![1];
            // Should not start with semver range operators
            expect(version).not.toMatch(/^[~^>=<]/);
        });
    });
});
