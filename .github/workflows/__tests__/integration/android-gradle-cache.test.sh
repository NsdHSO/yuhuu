#!/usr/bin/env bash
# ============================================================================
# Integration Test: Android Gradle Cache Effectiveness
# ============================================================================
#
# This script validates Gradle cache behavior in CI.
# Run this AFTER a successful build to measure cache effectiveness.
#
# Usage:
#   chmod +x .github/workflows/__tests__/integration/android-gradle-cache.test.sh
#   .github/workflows/__tests__/integration/android-gradle-cache.test.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed
# ============================================================================

set -euo pipefail

PASS=0
FAIL=0
TOTAL=0

# Test helper
assert() {
    local description="$1"
    local result="$2"  # 0 = pass, non-zero = fail
    TOTAL=$((TOTAL + 1))
    if [ "$result" -eq 0 ]; then
        PASS=$((PASS + 1))
        echo "PASS: $description"
    else
        FAIL=$((FAIL + 1))
        echo "FAIL: $description"
    fi
}

echo "============================================"
echo "Gradle Cache Integration Tests"
echo "============================================"
echo ""

# ----------------------------------------------------------------
# Test 1: Verify setup-gradle is referenced in workflow
# ----------------------------------------------------------------
WORKFLOW_FILE=".github/workflows/build-android.yml"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "ERROR: Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

grep -q "setup-gradle@v4" "$WORKFLOW_FILE"
assert "Workflow uses setup-gradle@v4" $?

# ----------------------------------------------------------------
# Test 2: Verify actions/cache@v4 is NOT used for Gradle
# ----------------------------------------------------------------
if grep -q "Cache Gradle dependencies" "$WORKFLOW_FILE" && grep -A5 "Cache Gradle dependencies" "$WORKFLOW_FILE" | grep -q "actions/cache@v4"; then
    assert "Workflow does NOT use actions/cache@v4 for Gradle" 1
else
    assert "Workflow does NOT use actions/cache@v4 for Gradle" 0
fi

# ----------------------------------------------------------------
# Test 3: Verify cache-read-only is configured
# ----------------------------------------------------------------
grep -q "cache-read-only" "$WORKFLOW_FILE"
assert "cache-read-only is configured" $?

# ----------------------------------------------------------------
# Test 4: Verify Gradle wrapper exists (post-prebuild)
# ----------------------------------------------------------------
if [ -d "android" ]; then
    if [ -f "android/gradle/wrapper/gradle-wrapper.jar" ] || [ -f "android/gradlew" ]; then
        assert "Gradle wrapper exists in android directory" 0
    else
        assert "Gradle wrapper exists in android directory" 1
    fi
else
    echo "SKIP: android/ directory not present (pre-prebuild)"
fi

# ----------------------------------------------------------------
# Test 5: Verify Gradle cache directory exists (CI only)
# ----------------------------------------------------------------
if [ -n "${CI:-}" ]; then
    if [ -d "$HOME/.gradle/caches" ]; then
        assert "Gradle cache directory exists" 0

        # Test 6: Cache is non-empty (indicates cache restore worked)
        CACHE_SIZE=$(du -sm "$HOME/.gradle/caches" 2>/dev/null | cut -f1)
        if [ "${CACHE_SIZE:-0}" -gt 0 ]; then
            assert "Gradle cache is non-empty (${CACHE_SIZE}MB)" 0
        else
            assert "Gradle cache is non-empty" 1
        fi
    else
        assert "Gradle cache directory exists" 1
    fi
else
    echo "SKIP: Gradle cache directory check (not in CI)"
fi

# ----------------------------------------------------------------
# Test 6: Verify configuration cache setting
# ----------------------------------------------------------------
HAS_CONFIG_CACHE=1
if grep -q "configuration-cache" "$WORKFLOW_FILE"; then
    HAS_CONFIG_CACHE=0
elif [ -f "android/gradle.properties" ] && grep -q "org.gradle.configuration-cache=true" "android/gradle.properties"; then
    HAS_CONFIG_CACHE=0
fi
assert "Configuration cache is enabled" $HAS_CONFIG_CACHE

# ----------------------------------------------------------------
# Summary
# ----------------------------------------------------------------
echo ""
echo "============================================"
echo "Results: $PASS passed, $FAIL failed, $TOTAL total"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
exit 0
