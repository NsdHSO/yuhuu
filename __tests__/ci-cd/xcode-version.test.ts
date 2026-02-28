/**
 * Tests for iOS Xcode version pinning in build-ios.yml
 *
 * TDD RED Phase: These tests validate that the xcode-version is pinned
 * to a specific version ('15.4') instead of 'latest-stable'.
 *
 * Pinning Xcode prevents:
 * - Non-deterministic builds from automatic Xcode upgrades
 * - Unexpected build failures when GitHub updates runner images
 * - Cache invalidation from changing DerivedData paths
 * - SDK/toolchain mismatches across builds
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOW_PATH = path.resolve(
  __dirname,
  '../../.github/workflows/build-ios.yml'
);

const PINNED_XCODE_VERSION = '15.4';

describe('iOS Build Workflow - Xcode Version Pinning', () => {
  let workflowContent: string;

  beforeAll(() => {
    workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
  });

  it('should have a build-ios.yml workflow file', () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('should use maxim-lobanov/setup-xcode action', () => {
    expect(workflowContent).toContain('maxim-lobanov/setup-xcode');
  });

  it('should pin xcode-version to a specific version, not latest-stable', () => {
    // Extract the xcode-version value from the workflow
    const xcodeVersionMatch = workflowContent.match(
      /xcode-version:\s*(.+)/
    );

    expect(xcodeVersionMatch).not.toBeNull();

    const xcodeVersion = xcodeVersionMatch![1].trim().replace(/['"]/g, '');

    expect(xcodeVersion).not.toBe('latest-stable');
    expect(xcodeVersion).not.toBe('latest');
    expect(xcodeVersion).not.toMatch(/^latest/i);
  });

  it(`should pin xcode-version to '${PINNED_XCODE_VERSION}'`, () => {
    const xcodeVersionMatch = workflowContent.match(
      /xcode-version:\s*(.+)/
    );

    expect(xcodeVersionMatch).not.toBeNull();

    const xcodeVersion = xcodeVersionMatch![1].trim().replace(/['"]/g, '');

    expect(xcodeVersion).toBe(PINNED_XCODE_VERSION);
  });

  it('should not contain dynamic Xcode version resolution keywords', () => {
    // Ensure no dynamic version resolution patterns exist
    const dynamicPatterns = [
      /xcode-version:\s*['"]?latest-stable['"]?/,
      /xcode-version:\s*['"]?latest['"]?/,
      /xcode-version:\s*\$\{\{/,  // No expression-based versions
    ];

    for (const pattern of dynamicPatterns) {
      expect(workflowContent).not.toMatch(pattern);
    }
  });

  it('should have xcode-version under setup-xcode with block', () => {
    // Verify the structure: setup-xcode action has a 'with' block containing xcode-version
    const setupXcodeBlock = workflowContent.match(
      /uses:\s*maxim-lobanov\/setup-xcode@v\d+\s*\n\s*with:\s*\n\s*xcode-version:/
    );

    expect(setupXcodeBlock).not.toBeNull();
  });

  it('should use a valid semantic version format for xcode-version', () => {
    const xcodeVersionMatch = workflowContent.match(
      /xcode-version:\s*['"]?([^'"\s\n]+)['"]?/
    );

    expect(xcodeVersionMatch).not.toBeNull();

    const version = xcodeVersionMatch![1];

    // Valid formats: '15.4', '15.4.0', '15'
    expect(version).toMatch(/^\d+(\.\d+){0,2}$/);
  });

  it('should set xcode-version as a string value (quoted or unquoted number)', () => {
    // The value should be parseable - either quoted string or a bare number
    const xcodeVersionLine = workflowContent
      .split('\n')
      .find((line) => line.includes('xcode-version:'));

    expect(xcodeVersionLine).toBeDefined();
    expect(xcodeVersionLine).toMatch(/xcode-version:\s*.+/);
  });
});

describe('iOS Build Workflow - Xcode Caching Compatibility', () => {
  let workflowContent: string;

  beforeAll(() => {
    workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
  });

  it('should use derivedDataPath for xcodebuild output', () => {
    // DerivedData path is needed for caching; pinned Xcode ensures stable paths
    expect(workflowContent).toContain('-derivedDataPath');
  });

  it('should run on macos runner', () => {
    expect(workflowContent).toMatch(/runs-on:\s*macos/);
  });

  it('should have setup-xcode step before the build step', () => {
    const setupXcodeIndex = workflowContent.indexOf('setup-xcode');
    const buildIndex = workflowContent.indexOf('xcodebuild');

    expect(setupXcodeIndex).toBeGreaterThan(-1);
    expect(buildIndex).toBeGreaterThan(-1);
    expect(setupXcodeIndex).toBeLessThan(buildIndex);
  });
});
