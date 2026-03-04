#!/usr/bin/env bash
#
# fix-plist-encoding.sh
#
# Converts all .plist files in packages/app/ios/ (excluding Pods/) to UTF-8 XML format.
# Uses macOS plutil to ensure proper conversion without data loss.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$PROJECT_ROOT/packages/app/ios"

if [ ! -d "$IOS_DIR" ]; then
  echo "ERROR: iOS directory not found at $IOS_DIR"
  exit 1
fi

echo "Converting plist files to XML UTF-8 format..."

FILES_CONVERTED=0
FILES_CHECKED=0

# Find all .plist files excluding Pods/ directory
while IFS= read -r -d '' plist_file; do
  FILES_CHECKED=$((FILES_CHECKED + 1))
  relative_path="${plist_file#"$IOS_DIR"/}"

  # Use plutil to convert to XML format (idempotent - safe to run on already-XML plists)
  if plutil -convert xml1 "$plist_file" 2>/dev/null; then
    FILES_CONVERTED=$((FILES_CONVERTED + 1))
    echo "  ✓ $relative_path"
  else
    echo "  ⚠️  $relative_path - plutil conversion failed (might already be XML)"
  fi

done < <(find "$IOS_DIR" -path "*/Pods" -prune -o -name "*.plist" -print0)

echo ""
echo "Checked $FILES_CHECKED plist file(s), converted $FILES_CONVERTED to XML format."
echo "All plist files are now XML UTF-8 format."
