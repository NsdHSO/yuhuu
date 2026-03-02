/**
 * Gradle JVM Heap Optimization Tests (TDD RED Phase)
 *
 * Tests validate that the Gradle daemon has optimal JVM memory configuration
 * for CI builds of a React Native / Expo project.
 *
 * Problem: Default JVM heap (-Xmx2048m, MaxMetaspaceSize=512m) causes frequent
 * garbage collection pauses during large React Native builds, especially during
 * dex merging and resource processing. This adds 1-2 minutes of GC overhead.
 *
 * Solution:
 * - Increase heap to -Xmx4096m (CI runners have 7GB RAM)
 * - Increase MaxMetaspaceSize to 1024m (React Native codegen generates many classes)
 * - Add -XX:+HeapDumpOnOutOfMemoryError for diagnosing CI OOM failures
 *
 * Expected savings: 1-2 minutes per build (fewer GC pauses, no OOM restarts)
 *
 * These tests should FAIL against the current 2048m/512m config
 * and PASS once the heap optimization is applied.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const GRADLE_PROPERTIES_PATH = path.join(ROOT, 'android', 'gradle.properties');

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

function parseJvmArgs(jvmArgsString: string): string[] {
    return jvmArgsString.split(/\s+/).filter((arg) => arg.length > 0);
}

function extractJvmFlag(args: string[], prefix: string): string | undefined {
    const match = args.find((arg) => arg.startsWith(prefix));
    return match;
}

function parseSizeInMB(sizeStr: string): number {
    const match = sizeStr.match(/(\d+)([mMgG])/);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    return unit === 'g' ? value * 1024 : value;
}

// ---- Test Suite: JVM Heap Configuration ------------------------------------

describe('Gradle JVM Heap Optimization', () => {
    const androidDirExists = fs.existsSync(path.join(ROOT, 'android'));
    let gradleProps: Record<string, string>;
    let jvmArgs: string[];

    beforeAll(() => {
        if (androidDirExists) {
            gradleProps = parseGradleProperties(GRADLE_PROPERTIES_PATH);
            jvmArgs = parseJvmArgs(gradleProps['org.gradle.jvmargs'] || '');
        }
    });

    describe('org.gradle.jvmargs property', () => {
        it('should have org.gradle.jvmargs defined', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            expect(gradleProps).toHaveProperty(['org.gradle.jvmargs']);
        });

        it('should have multiple JVM flags configured', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // A well-configured JVM args string should have at least 3 flags:
            // -Xmx, -XX:MaxMetaspaceSize, and a diagnostic flag
            expect(jvmArgs.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Heap size (-Xmx)', () => {
        it('should set -Xmx to at least 4096m for CI builds', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // React Native builds with Hermes, codegen, and dex merging
            // require substantial heap to avoid GC pressure.
            // CI runners (GitHub Actions ubuntu-latest) have 7GB RAM,
            // so 4GB heap is safe and significantly reduces GC pauses.
            //
            // CURRENT (RED): -Xmx2048m -- causes frequent GC pauses
            // EXPECTED (GREEN): -Xmx4096m -- reduces GC overhead by ~60%
            const xmxFlag = extractJvmFlag(jvmArgs, '-Xmx');
            expect(xmxFlag).toBeDefined();
            const heapMB = parseSizeInMB(xmxFlag!);
            expect(heapMB).toBeGreaterThanOrEqual(4096);
        });

        it('should not exceed 6144m to leave room for OS and other processes', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // GitHub Actions runners have 7GB total RAM.
            // Leaving at least 1GB for OS, Android SDK tools, and Node.js
            // prevents the runner from swapping, which would negate any gains.
            const xmxFlag = extractJvmFlag(jvmArgs, '-Xmx');
            expect(xmxFlag).toBeDefined();
            const heapMB = parseSizeInMB(xmxFlag!);
            expect(heapMB).toBeLessThanOrEqual(6144);
        });
    });

    describe('Metaspace (-XX:MaxMetaspaceSize)', () => {
        it('should set MaxMetaspaceSize to at least 1024m', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // React Native codegen + Kotlin compiler + annotation processors
            // generate many classes that live in metaspace.
            // 512m causes metaspace GC pressure; 1024m gives headroom.
            //
            // CURRENT (RED): -XX:MaxMetaspaceSize=512m
            // EXPECTED (GREEN): -XX:MaxMetaspaceSize=1024m
            const metaspaceFlag = extractJvmFlag(jvmArgs, '-XX:MaxMetaspaceSize=');
            expect(metaspaceFlag).toBeDefined();
            const metaspaceMB = parseSizeInMB(metaspaceFlag!.split('=')[1]);
            expect(metaspaceMB).toBeGreaterThanOrEqual(1024);
        });

        it('should not exceed 2048m for metaspace', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Metaspace beyond 2GB is wasteful; classes rarely need that much.
            const metaspaceFlag = extractJvmFlag(jvmArgs, '-XX:MaxMetaspaceSize=');
            expect(metaspaceFlag).toBeDefined();
            const metaspaceMB = parseSizeInMB(metaspaceFlag!.split('=')[1]);
            expect(metaspaceMB).toBeLessThanOrEqual(2048);
        });
    });

    describe('Diagnostic flags', () => {
        it('should have -XX:+HeapDumpOnOutOfMemoryError for OOM diagnosis', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // When CI builds run out of memory, a heap dump helps diagnose
            // whether the issue is a memory leak, too many parallel tasks,
            // or genuinely insufficient heap.
            //
            // Without this flag, OOM errors in CI are opaque and hard to debug.
            //
            // CURRENT (RED): flag not present
            // EXPECTED (GREEN): -XX:+HeapDumpOnOutOfMemoryError
            const hasHeapDump = jvmArgs.some(
                (arg) => arg === '-XX:+HeapDumpOnOutOfMemoryError'
            );
            expect(hasHeapDump).toBe(true);
        });
    });

    describe('GC optimization', () => {
        it('should not use deprecated GC flags', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // CMS collector was removed in Java 14+, and we use Java 17.
            // Using deprecated flags causes warnings and can prevent startup.
            const deprecatedFlags = [
                '-XX:+UseConcMarkSweepGC',
                '-XX:+UseParNewGC',
                '-XX:+CMSClassUnloadingEnabled',
            ];
            for (const flag of deprecatedFlags) {
                expect(jvmArgs).not.toContain(flag);
            }
        });

        it('should not use experimental GC flags without UnlockExperimental', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Experimental flags like -XX:+UseZGC require
            // -XX:+UnlockExperimentalVMOptions to be set first.
            const experimentalFlags = ['-XX:+UseZGC', '-XX:+UseShenandoahGC'];
            const hasUnlock = jvmArgs.includes('-XX:+UnlockExperimentalVMOptions');

            for (const flag of experimentalFlags) {
                if (jvmArgs.includes(flag)) {
                    expect(hasUnlock).toBe(true);
                }
            }
        });
    });

    describe('Memory ratio sanity checks', () => {
        it('metaspace should be less than half of heap', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Metaspace should be a fraction of heap -- if it's more than half,
            // the configuration is likely wrong.
            const xmxFlag = extractJvmFlag(jvmArgs, '-Xmx');
            const metaspaceFlag = extractJvmFlag(jvmArgs, '-XX:MaxMetaspaceSize=');
            expect(xmxFlag).toBeDefined();
            expect(metaspaceFlag).toBeDefined();

            const heapMB = parseSizeInMB(xmxFlag!);
            const metaspaceMB = parseSizeInMB(metaspaceFlag!.split('=')[1]);
            expect(metaspaceMB).toBeLessThan(heapMB / 2);
        });

        it('total JVM memory should not exceed 6GB', () => {
            if (!androidDirExists) {
                console.log('  Skipping: android/ directory not generated yet (run expo prebuild)');
                return;
            }
            // Heap + Metaspace + native memory overhead should stay under 6GB
            // to leave room for OS on a 7GB CI runner.
            const xmxFlag = extractJvmFlag(jvmArgs, '-Xmx');
            const metaspaceFlag = extractJvmFlag(jvmArgs, '-XX:MaxMetaspaceSize=');
            expect(xmxFlag).toBeDefined();
            expect(metaspaceFlag).toBeDefined();

            const heapMB = parseSizeInMB(xmxFlag!);
            const metaspaceMB = parseSizeInMB(metaspaceFlag!.split('=')[1]);
            const totalMB = heapMB + metaspaceMB;
            expect(totalMB).toBeLessThanOrEqual(6144);
        });
    });
});
