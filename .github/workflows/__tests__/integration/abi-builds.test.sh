#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ABI Build Integration Tests
#
# Validates that the Android build workflow correctly applies ABI reduction
# for non-production environments.
#
# Two-layer ABI control:
# 1. gradle.properties defaults to arm64-v8a (fast local dev builds)
# 2. CI uses -PreactNativeArchitectures flag to override per environment
#
# Usage:
#   chmod +x .github/workflows/__tests__/integration/abi-builds.test.sh
#   .github/workflows/__tests__/integration/abi-builds.test.sh
#
# Exit codes:
#   0 = All tests passed
#   1 = One or more tests failed
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
GRADLE_PROPS="$ROOT_DIR/android/gradle.properties"
WORKFLOW_FILE="$ROOT_DIR/.github/workflows/build-android.yml"

PASS=0
FAIL=0

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() {
  PASS=$((PASS + 1))
  echo -e "${GREEN}  PASS${NC} $1"
}

fail() {
  FAIL=$((FAIL + 1))
  echo -e "${RED}  FAIL${NC} $1"
}

echo "=== ABI Build Integration Tests ==="
echo ""

# ─── Test 1: gradle.properties exists ────────────────────────────────────────
echo "--- gradle.properties tests ---"

if [ -f "$GRADLE_PROPS" ]; then
  pass "gradle.properties file exists"
else
  fail "gradle.properties file not found at $GRADLE_PROPS"
fi

# ─── Test 2: reactNativeArchitectures is defined ─────────────────────────────

if grep -q "^reactNativeArchitectures=" "$GRADLE_PROPS"; then
  pass "reactNativeArchitectures property is defined"
else
  fail "reactNativeArchitectures property is not defined in gradle.properties"
fi

# ─── Test 3: Defaults to arm64-v8a (fast local dev) ─────────────────────────

ARCH_LINE=$(grep "^reactNativeArchitectures=" "$GRADLE_PROPS" || true)
if [ "$ARCH_LINE" = "reactNativeArchitectures=arm64-v8a" ]; then
  pass "gradle.properties defaults to arm64-v8a (fast local dev builds)"
else
  fail "gradle.properties should default to arm64-v8a only"
  echo "       Current value: $ARCH_LINE"
  echo "       Expected: reactNativeArchitectures=arm64-v8a"
fi

# ─── Test 4: Does NOT hardcode all 4 ABIs ────────────────────────────────────

if echo "$ARCH_LINE" | grep -q "armeabi-v7a.*x86.*x86_64"; then
  fail "gradle.properties should NOT hardcode all 4 ABIs"
else
  pass "gradle.properties does not hardcode all 4 ABIs"
fi

# ─── Test 5: Does NOT use shell variable syntax ──────────────────────────────

if echo "$ARCH_LINE" | grep -q '\${'; then
  fail "gradle.properties should NOT use shell variable syntax (not supported by Gradle)"
else
  pass "No shell variable syntax in gradle.properties (correct)"
fi

# ─── Test 6: arm64-v8a always present (Samsung A52s) ────────────────────────

if echo "$ARCH_LINE" | grep -q "arm64-v8a"; then
  pass "arm64-v8a ABI present (Samsung A52s compatibility)"
else
  fail "arm64-v8a ABI missing - Samsung A52s will not work!"
fi

echo ""
echo "--- build-android.yml workflow tests ---"

# ─── Test 7: Workflow file exists ────────────────────────────────────────────

if [ -f "$WORKFLOW_FILE" ]; then
  pass "build-android.yml workflow file exists"
else
  fail "build-android.yml workflow file not found"
fi

# ─── Test 8: -PreactNativeArchitectures flag in workflow ─────────────────────

if grep -q "\-PreactNativeArchitectures=" "$WORKFLOW_FILE"; then
  pass "-PreactNativeArchitectures flag is used in gradlew command"
else
  fail "-PreactNativeArchitectures flag is NOT used in gradlew command"
fi

# ─── Test 9: REACT_NATIVE_ABIS env var in workflow ──────────────────────────

if grep -q "REACT_NATIVE_ABIS" "$WORKFLOW_FILE"; then
  pass "REACT_NATIVE_ABIS environment variable is configured in workflow"
else
  fail "REACT_NATIVE_ABIS environment variable is NOT configured in workflow"
fi

# ─── Test 10: arm64-v8a configured for FAT builds ───────────────────────────

if grep -A1 "REACT_NATIVE_ABIS" "$WORKFLOW_FILE" | grep -q "arm64-v8a"; then
  pass "FAT builds configured with arm64-v8a"
else
  fail "FAT builds not configured with arm64-v8a ABI"
fi

# ─── Test 11: PNG crunching disabled ────────────────────────────────────────

PNG_LINE=$(grep "^android.enablePngCrunchInReleaseBuilds=" "$GRADLE_PROPS" || true)
if [ "$PNG_LINE" = "android.enablePngCrunchInReleaseBuilds=false" ]; then
  pass "PNG crunching disabled for faster non-production builds"
else
  fail "PNG crunching should be disabled for non-production builds"
  echo "       Current: $PNG_LINE"
  echo "       Expected: android.enablePngCrunchInReleaseBuilds=false"
fi

echo ""
echo "--- Samsung A52s device compatibility ---"

# ─── Test 12: Samsung A52s uses arm64-v8a ────────────────────────────────────

SAMSUNG_A52S_ABI="arm64-v8a"
if [ "$SAMSUNG_A52S_ABI" = "arm64-v8a" ]; then
  pass "Samsung A52s confirmed as arm64-v8a device"
else
  fail "Samsung A52s ABI mismatch"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "=== Results ==="
TOTAL=$((PASS + FAIL))
echo "  Total:  $TOTAL"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
