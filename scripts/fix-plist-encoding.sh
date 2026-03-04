#!/usr/bin/env bash
#
# fix-plist-encoding.sh
#
# Converts all .plist files in packages/app/ios/ (excluding Pods/) to UTF-8 XML format.
# Handles binary plists, UTF-16 encoding, BOM removal, and validates the result.
# Designed to run in CI after expo prebuild and before pod install.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/packages/app/ios"

if [ ! -d "$IOS_DIR" ]; then
  echo "ERROR: iOS directory not found at $IOS_DIR"
  exit 1
fi

echo "Fixing plist encoding in $IOS_DIR ..."

FILES_FIXED=0
FILES_CHECKED=0
ERRORS=0

# Find all .plist files excluding Pods/ directory
while IFS= read -r -d '' plist_file; do
  FILES_CHECKED=$((FILES_CHECKED + 1))
  relative_path="${plist_file#"$IOS_DIR"/}"

  # 1. Convert binary plist to XML using plutil
  if head -c 6 "$plist_file" | grep -q "bplist"; then
    echo "  FIX: $relative_path - converting binary plist to XML"
    if plutil -convert xml1 "$plist_file"; then
      FILES_FIXED=$((FILES_FIXED + 1))
    else
      echo "  ERROR: $relative_path - plutil conversion failed"
      ERRORS=$((ERRORS + 1))
      continue
    fi
  fi

  # 2. Remove BOM if present (UTF-8 BOM: EF BB BF)
  first_bytes=$(xxd -p -l 3 "$plist_file" 2>/dev/null || echo "")
  if [ "$first_bytes" = "efbbbf" ]; then
    echo "  FIX: $relative_path - removing UTF-8 BOM"
    tmp_file=$(mktemp)
    tail -c +4 "$plist_file" > "$tmp_file"
    mv "$tmp_file" "$plist_file"
    FILES_FIXED=$((FILES_FIXED + 1))
  fi

  # 3. Convert UTF-16 to UTF-8
  first_two_bytes="${first_bytes:0:4}"
  if [ "$first_two_bytes" = "fffe" ] || [ "$first_two_bytes" = "feff" ]; then
    echo "  FIX: $relative_path - converting UTF-16 to UTF-8"
    tmp_file=$(mktemp)
    iconv -f UTF-16 -t UTF-8 "$plist_file" > "$tmp_file"
    mv "$tmp_file" "$plist_file"
    FILES_FIXED=$((FILES_FIXED + 1))
  else
    file_encoding=$(file --mime-encoding "$plist_file" 2>/dev/null || echo "")
    if echo "$file_encoding" | grep -qi "utf-16"; then
      echo "  FIX: $relative_path - converting UTF-16 to UTF-8 (detected by file)"
      tmp_file=$(mktemp)
      iconv -f UTF-16 -t UTF-8 "$plist_file" > "$tmp_file"
      mv "$tmp_file" "$plist_file"
      FILES_FIXED=$((FILES_FIXED + 1))
    fi
  fi

  # 4. Ensure plutil can convert it to xml1 (catches remaining edge cases)
  plutil -convert xml1 "$plist_file" 2>/dev/null || true

  # 5. Validate the result
  first_line=$(head -n 1 "$plist_file" 2>/dev/null || echo "")
  expected_header='<?xml version="1.0" encoding="UTF-8"?>'
  if [ "$first_line" != "$expected_header" ]; then
    echo "  ERROR: $relative_path - still not valid UTF-8 XML after fix attempts"
    echo "         First line: $first_line"
    ERRORS=$((ERRORS + 1))
  fi

done < <(find "$IOS_DIR" -path "*/Pods" -prune -o -name "*.plist" -print0)

echo ""
echo "Checked $FILES_CHECKED plist file(s)."
if [ "$FILES_FIXED" -gt 0 ]; then
  echo "Fixed $FILES_FIXED encoding issue(s)."
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "ERROR: $ERRORS plist file(s) could not be fixed."
  exit 1
else
  echo "All plist files are valid UTF-8 XML."
  exit 0
fi
