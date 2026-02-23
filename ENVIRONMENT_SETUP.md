# Environment Setup Guide

Complete guide to setting up your development environment for the Yuhuu boilerplate.

## Prerequisites

### Required

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **pnpm** (recommended) or npm
  ```bash
  npm install -g pnpm
  ```

### Platform-Specific

#### iOS Development (macOS only)
- **Xcode** 15.0 or higher ([Download from Mac App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```
- **CocoaPods**
  ```bash
  sudo gem install cocoapods
  ```
- **Watchman** (optional but recommended)
  ```bash
  brew install watchman
  ```

#### Android Development
- **Android Studio** ([Download](https://developer.android.com/studio))
- **Java Development Kit (JDK)** 17 or higher
  ```bash
  # macOS with Homebrew
  brew install openjdk@17

  # Verify installation
  java -version
  ```

## Step-by-Step Setup

### 1. Install Node.js

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be v18.x or higher
npm --version
```

### 2. Install pnpm (Recommended)

```bash
npm install -g pnpm
pnpm --version
```

### 3. Install Expo CLI

```bash
npm install -g expo-cli eas-cli
```

### 4. Clone and Setup Project

```bash
# Navigate to your projects directory
cd ~/Documents/projects

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### 5. iOS Setup (macOS only)

#### Install Xcode
1. Download Xcode from the Mac App Store
2. Open Xcode and accept the license agreement
3. Install Command Line Tools:
   ```bash
   xcode-select --install
   ```

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

#### Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

#### Run iOS App
```bash
pnpm ios
# or
npx expo run:ios
```

### 6. Android Setup

#### Install Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer
3. Open Android Studio and complete the setup wizard

#### Configure Android SDK
1. Open Android Studio → Settings/Preferences
2. Navigate to Appearance & Behavior → System Settings → Android SDK
3. Install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

#### Set Environment Variables

Add to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Apply changes:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

#### Create Android Emulator
1. Open Android Studio
2. Tools → Device Manager
3. Create Device → Choose a device definition (e.g., Pixel 5)
4. Download a system image (e.g., API 34)
5. Finish setup

#### Run Android App
```bash
pnpm android
# or
npx expo run:android
```

### 7. Web Setup

No additional setup required! Just run:

```bash
pnpm web
# or
npx expo start --web
```

## Verification

Test your setup by running the development server:

```bash
pnpm start
```

You should see:
- QR code for Expo Go
- Options to open iOS simulator
- Options to open Android emulator
- Options to open in web browser

## IDE Setup

### VS Code (Recommended)

Install recommended extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Tailwind CSS IntelliSense**
- **TypeScript and JavaScript Language Features**

Settings are pre-configured in `.vscode/settings.json`

### Other IDEs

For IntelliJ IDEA, WebStorm, or other JetBrains IDEs, settings are in `.idea/` directory.

## Environment Configuration

### Local Development

The project uses environment variables for configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit .env to add your values
# EXPO_PUBLIC_API_URL=http://localhost:3000
# EXPO_PUBLIC_ENV=local
```

### GitHub Secrets (for CI/CD)

Configure these in your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add required secrets:
   - `EXPO_TOKEN` - Your Expo access token
   - `DEV_API_URL` - Development API endpoint (optional)
   - `STAGING_API_URL` - Staging API endpoint (optional)
   - `PROD_API_URL` - Production API endpoint (optional)

## Troubleshooting

### iOS Issues

**Issue: "Could not find iPhone X simulator"**
```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 15"
```

**Issue: Pod install fails**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Issues

**Issue: "SDK location not found"**

Create `android/local.properties`:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

**Issue: "Gradle build failed"**
```bash
cd android
./gradlew clean
cd ..
```

### General Issues

**Issue: Metro bundler not starting**
```bash
# Clear cache and restart
pnpm start --clear
```

**Issue: Dependencies not installing**
```bash
# Clear node modules and reinstall
rm -rf node_modules
pnpm install
```

**Issue: Expo Go not connecting**
- Ensure phone and computer are on the same WiFi network
- Try using tunnel mode: `pnpm start --tunnel`

## Additional Tools

### Watchman (Recommended for macOS)
Improves file watching performance:
```bash
brew install watchman
```

### React Native Debugger
Standalone debugging tool:
```bash
brew install --cask react-native-debugger
```

## Next Steps

1. Read the [README.md](./README.md) for project overview
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
3. Start developing in the `app/` directory

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [NativeWind Setup](https://www.nativewind.dev/quick-starts/expo)
- [EAS Build Setup](https://docs.expo.dev/build/setup/)
