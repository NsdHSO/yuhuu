#!/usr/bin/env bash
#
# validate-plist-encoding.sh
#
# Validates (and optionally fixes) .plist files in packages/app/ios/ (excluding Pods/)
# ensuring they are UTF-8 XML format, have no BOM, and start with the correct XML declaration.
#
# Usage:
#   ./scripts/validate-plist-encoding.sh          # Validate only (exits 1 on failure)
#   ./scripts/validate-plist-encoding.sh --fix     # Fix encoding issues, then validate
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/packages/app/ios"

FIX_MODE=false
if [ "${1:-}" = "--fix" ]; then
  FIX_MODE=true
fi

if [ ! -d "$IOS_DIR" ]; then
  echo "ERROR: iOS directory not found at $IOS_DIR"
  exit 1
fi

ERRORS=0
FIXED=0
FILES_CHECKED=0

fix_plist() {
  local plist_file="$1"
  local relative_path="$2"

  # 1. Convert binary plist to XML
  if head -c 6 "$plist_file" | grep -q "bplist"; then
    echo "FIX: $relative_path - Converting binary plist to XML"
    plutil -convert xml1 "$plist_file"
    FIXED=$((FIXED + 1))
  fi

  # 2. Convert UTF-16 to UTF-8
  local file_encoding
  file_encoding=$(file --mime-encoding "$plist_file")
  if echo "$file_encoding" | grep -qi "utf-16"; then
    echo "FIX: $relative_path - Converting UTF-16 to UTF-8"
    local tmp_file
    tmp_file=$(mktemp)
    iconv -f UTF-16 -t UTF-8 "$plist_file" > "$tmp_file"
    mv "$tmp_file" "$plist_file"
    FIXED=$((FIXED + 1))
  fi

  # 3. Remove BOM if present
  local first_bytes
  first_bytes=$(xxd -p -l 3 "$plist_file")
  if [ "$first_bytes" = "efbbbf" ]; then
    echo "FIX: $relative_path - Removing UTF-8 BOM"
    local tmp_file
    tmp_file=$(mktemp)
    tail -c +4 "$plist_file" > "$tmp_file"
    mv "$tmp_file" "$plist_file"
    FIXED=$((FIXED + 1))
  fi

  # 4. Ensure XML declaration is present
  local first_line
  first_line=$(head -n 1 "$plist_file")
  local expected_header='<?xml version="1.0" encoding="UTF-8"?>'
  if [ "$first_line" != "$expected_header" ]; then
    # plutil -convert xml1 should have added the header, but if not, force it
    plutil -convert xml1 "$plist_file" 2>/dev/null || true
    FIXED=$((FIXED + 1))
  fi
}

validate_plist() {
  local plist_file="$1"
  local relative_path="$2"
  local has_error=false

  # 1. Check for binary plist format
  if head -c 6 "$plist_file" | grep -q "bplist"; then
    echo "FAIL: $relative_path - Binary plist format detected (must be XML)"
    has_error=true
  fi

  if [ "$has_error" = true ]; then
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 2. Check for BOM (Byte Order Mark)
  local first_bytes
  first_bytes=$(xxd -p -l 3 "$plist_file")
  if [ "$first_bytes" = "efbbbf" ]; then
    echo "FAIL: $relative_path - UTF-8 BOM detected (must have no BOM)"
    ERRORS=$((ERRORS + 1))
    return
  fi

  local first_two_bytes="${first_bytes:0:4}"
  if [ "$first_two_bytes" = "fffe" ] || [ "$first_two_bytes" = "feff" ]; then
    echo "FAIL: $relative_path - UTF-16 BOM detected (must be UTF-8 with no BOM)"
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 3. Check encoding via file command
  local file_encoding
  file_encoding=$(file --mime-encoding "$plist_file")
  if echo "$file_encoding" | grep -qi "utf-16"; then
    echo "FAIL: $relative_path - UTF-16 encoding detected (must be UTF-8)"
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 4. Check that file starts with <?xml version="1.0" encoding="UTF-8"?>
  local first_line
  first_line=$(head -n 1 "$plist_file")
  local expected_header='<?xml version="1.0" encoding="UTF-8"?>'
  if [ "$first_line" != "$expected_header" ]; then
    echo "FAIL: $relative_path - First line must be: $expected_header"
    echo "      Got: $first_line"
    ERRORS=$((ERRORS + 1))
    return
  fi

  # 5. Validate XML is well-formed using xmllint if available
  if command -v xmllint &>/dev/null; then
    if ! xmllint --noout "$plist_file" 2>/dev/null; then
      echo "FAIL: $relative_path - XML is not well-formed"
      ERRORS=$((ERRORS + 1))
      return
    fi
  fi
}

# Find all .plist files excluding Pods/ directory
while IFS= read -r -d '' plist_file; do
  FILES_CHECKED=$((FILES_CHECKED + 1))
  relative_path="${plist_file#"$IOS_DIR"/}"

  if [ "$FIX_MODE" = true ]; then
    fix_plist "$plist_file" "$relative_path"
  fi

  validate_plist "$plist_file" "$relative_path"

done < <(find "$IOS_DIR" -path "*/Pods" -prune -o -name "*.plist" -print0)

echo ""
echo "Checked $FILES_CHECKED plist file(s)."

if [ "$FIX_MODE" = true ] && [ "$FIXED" -gt 0 ]; then
  echo "Fixed $FIXED encoding issue(s)."
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "$ERRORS error(s) found."
  exit 1
else
  echo "All plist files are valid UTF-8 XML with correct encoding."
  exit 0
fi
