#!/bin/bash

echo "🧹 Clearing all Metro bundler and build caches..."

# Stop Metro bundler
echo "Stopping Metro bundler..."
killall -9 node 2>/dev/null || true

# Clear watchman (if installed)
echo "Clearing watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
fi

# Clear Metro bundler cache
echo "Clearing Metro bundler cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

# Clear React Native packager cache
echo "Clearing React Native packager cache..."
rm -rf ~/.cache/react-native-packager 2>/dev/null || true

# Clear react-native-css-interop cache
echo "Clearing react-native-css-interop cache..."
find node_modules/.pnpm -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true

# Clear TypeScript build info
echo "Clearing TypeScript build info..."
find packages -name "tsconfig.tsbuildinfo" -delete 2>/dev/null || true

# Clear Expo cache
echo "Clearing Expo cache..."
rm -rf ~/.expo/metro-cache 2>/dev/null || true
rm -rf ~/.expo/packager-info.json 2>/dev/null || true

# Clear iOS build (if exists)
echo "Clearing iOS build..."
rm -rf packages/app/ios/build 2>/dev/null || true
rm -rf packages/app/ios/Pods 2>/dev/null || true
rm -rf packages/app/ios/Podfile.lock 2>/dev/null || true

# Clear Android build (if exists)
echo "Clearing Android build..."
rm -rf packages/app/android/build 2>/dev/null || true
rm -rf packages/app/android/.gradle 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm install (to reinstall dependencies if needed)"
echo "2. Run: cd packages/app/ios && pod install (iOS only)"
echo "3. Run: pnpm start --clear (to start Metro with clean cache)"
