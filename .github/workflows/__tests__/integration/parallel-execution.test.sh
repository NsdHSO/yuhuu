#!/usr/bin/env bash
# Integration test: Validates parallel execution structure in test.yml workflow
# This script validates the YAML structure without requiring a YAML parser dependency.
#
# Usage: bash .github/workflows/__tests__/integration/parallel-execution.test.sh
# Exit code: 0 = all tests pass, 1 = one or more tests fail

set -euo pipefail

WORKFLOW_FILE=".github/workflows/test.yml"
CI_FILE=".github/workflows/ci.yml"
PASS=0
FAIL=0

# Color output (if terminal supports it)
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

pass() {
    PASS=$((PASS + 1))
    echo -e "${GREEN}PASS${NC}: $1"
}

fail() {
    FAIL=$((FAIL + 1))
    echo -e "${RED}FAIL${NC}: $1"
}

# Navigate to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../../../.."

echo "=== Parallel Execution Integration Tests ==="
echo "Testing: $WORKFLOW_FILE"
echo ""

# Test 1: test.yml exists
if [ -f "$WORKFLOW_FILE" ]; then
    pass "test.yml exists"
else
    fail "test.yml does not exist"
    echo "Cannot continue without workflow file"
    exit 1
fi

# Test 2: ci.yml exists
if [ -f "$CI_FILE" ]; then
    pass "ci.yml exists"
else
    fail "ci.yml does not exist"
fi

# Test 3: lint job exists
if grep -q "^  lint:" "$WORKFLOW_FILE"; then
    pass "lint job defined in test.yml"
else
    fail "lint job NOT defined in test.yml"
fi

# Test 4: test job exists
if grep -q "^  test:" "$WORKFLOW_FILE"; then
    pass "test job defined in test.yml"
else
    fail "test job NOT defined in test.yml"
fi

# Extract job sections using awk (macOS-compatible)
# Gets all lines from job start until next top-level job definition
extract_job_section() {
    local job_name="$1"
    local file="$2"
    awk "/^  ${job_name}:/{found=1; next} found && /^  [a-zA-Z]/{exit} found{print}" "$file"
}

LINT_SECTION=$(extract_job_section "lint" "$WORKFLOW_FILE")
TEST_SECTION=$(extract_job_section "test" "$WORKFLOW_FILE")

# Test 5: lint job has NO 'needs' (runs independently)
if echo "$LINT_SECTION" | grep -q "needs:"; then
    fail "lint job has 'needs' dependency (should run independently)"
else
    pass "lint job has no 'needs' dependency (runs in parallel)"
fi

# Test 6: test job has NO 'needs' on lint
if echo "$TEST_SECTION" | grep -q "needs:.*lint"; then
    fail "test job depends on lint (should run in parallel)"
else
    pass "test job does not depend on lint"
fi

# Test 7: test-complete job exists
if grep -q "test-complete:" "$WORKFLOW_FILE"; then
    pass "test-complete aggregation job exists"
else
    fail "test-complete aggregation job does NOT exist (needed to gate downstream builds)"
fi

# Test 8: test-complete depends on both lint and test
if grep -q "test-complete:" "$WORKFLOW_FILE"; then
    TC_SECTION=$(extract_job_section "test-complete" "$WORKFLOW_FILE")
    if echo "$TC_SECTION" | grep -q "needs:"; then
        # Check both lint and test are in needs
        NEEDS_LINE=$(echo "$TC_SECTION" | grep "needs:" | head -1)
        if echo "$TC_SECTION" | grep -q "lint" && echo "$TC_SECTION" | grep -q "test"; then
            pass "test-complete depends on both lint and test"
        else
            fail "test-complete does not depend on both lint and test"
        fi
    else
        fail "test-complete has no 'needs' dependency"
    fi
else
    fail "test-complete not found (skipping dependency check)"
fi

# Test 9: Workflow uses workflow_call (reusable)
if grep -q "workflow_call" "$WORKFLOW_FILE"; then
    pass "test.yml is a reusable workflow (workflow_call)"
else
    fail "test.yml is NOT a reusable workflow"
fi

# Test 10: Both jobs have timeout-minutes
if echo "$LINT_SECTION" | grep -q "timeout-minutes:"; then
    pass "lint job has timeout-minutes configured"
else
    fail "lint job missing timeout-minutes"
fi

if echo "$TEST_SECTION" | grep -q "timeout-minutes:"; then
    pass "test job has timeout-minutes configured"
else
    fail "test job missing timeout-minutes"
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo "Total:  $((PASS + FAIL))"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo "Some tests failed! The test-complete aggregation job needs to be added."
    exit 1
fi

echo ""
echo "All tests passed!"
exit 0
