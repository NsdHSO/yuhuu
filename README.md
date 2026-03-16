# Yuhuu - React Native Boilerplate 👋

A production-ready, fully-tested boilerplate for building cross-platform mobile and web applications with React Native
and Expo. Features complete authentication flow, comprehensive test coverage, and modern development practices.

## 📥 Download Latest Build

[![Latest FAT Build](https://img.shields.io/github/v/release/NsdHSO/yuhuu?include_prereleases&label=Latest%20FAT%20Build&color=blue&filter=latest-fat-v*)](https://github.com/NsdHSO/yuhuu/releases)

**[📱 Download Latest Android APK](https://github.com/NsdHSO/yuhuu/releases)** • **[🍎 Download Latest iOS IPA](https://github.com/NsdHSO/yuhuu/releases/tag/latest-fat-ios)**

> 💡 **Tip:** Look for releases titled "FAT Build v##" (e.g., v85, v86, v87). Download the **highest version number** for the latest build.

**What this does:**

- Adds a clickable download link to the workflow run summary
- Uses the GitHub run number for versioned releases (e.g., v81, v82, v83)
- Makes it easy to share build links with your team
- Visible immediately after the workflow completes

**To view:**

1. Go to your repository's **Actions** tab
2. Click on any workflow run
3. Scroll to the bottom of the run summary
4. Click the download link to get the APK/IPA

## ✨ Features

### Core Features

- 🎯 **Cross-Platform**: iOS, Android, and Web support with unified codebase
- 🔐 **Complete Authentication**: Login, register, JWT token management with auto-refresh®†
- 🎨 **NativeWind**: Tailwind CSS v4 for React Native styling
- 📱 **Expo Router**: File-based navigation with type safety
- ⚡ **TypeScript**: Full type safety across the entire codebase
- 🧪 **Comprehensive Testing**: 300+ tests with 9 skipped (309 total)
- 🚀 **CI/CD Ready**: GitHub Actions workflows for automated builds and deployments
- 📊 **Modern Stack**: React 19, React Native 0.81, Expo 54

### Authentication & Security

- ✅ JWT access token with automatic refresh
- ✅ Secure token storage (SecureStore for native, localStorage for web)
- ✅ HTTP-only refresh token cookies for web
- ✅ Protected routes with role-based access control
- ✅ Password confirmation validation
- ✅ Form validation with user-friendly error messages
- ✅ Auto-redirect on token expiration

### UI/UX

- ✅ Dark mode support
- ✅ Safe area handling for notched devices (iPhone with Dynamic Island)
- ✅ Consistent button styles using TouchableOpacity
- ✅ Keyboard-aware forms with smooth scrolling
- ✅ Loading states and error handling
- ✅ Responsive design for all screen sizes

### Developer Experience

- ✅ Hot reload for instant feedback
- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Atomic design pattern for components
- ✅ Comprehensive unit and integration tests
- ✅ Test coverage reporting
- ✅ Git hooks support

## 🧪 Test Coverage

```
Test Suites: 16 passed, 16 total
Tests:       300 passed, 9 skipped, 309 total
Time:        ~4s
```

### Test Categories

- **Unit Tests**: Login screen, Register screen, AuthProvider, TokenManager, Components
- **Integration Tests**: Complete authentication flow (UI → API → Navigation)
- **Coverage**: Login/Register flows, password validation, token management, error handling

## 🛠 Tech Stack

| Category             | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Framework**        | Expo 54 with React Native 0.81                 |
| **UI Library**       | NativeWind (Tailwind CSS v4)                   |
| **Navigation**       | Expo Router (file-based)                       |
| **State Management** | React Query + Context API                      |
| **Authentication**   | JWT with auto-refresh                          |
| **Storage**          | Expo SecureStore (native) / localStorage (web) |
| **Testing**          | Jest + React Native Testing Library            |
| **Language**         | TypeScript 5.9                                 |
| **Package Manager**  | pnpm (recommended) / npm                       |
| **HTTP Client**      | Axios with interceptors                        |

## 🚀 Get Started

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **Package Manager**: pnpm (recommended) or npm
- **iOS Development**: Xcode 15+ and CocoaPods
- **Android Development**: Android Studio and SDK 33+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NsdHSO/yuhuu.git
   cd yuhuu
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your backend URLs:

   ```bash
   EXPO_PUBLIC_ENV=local
   EXPO_PUBLIC_AUTH_API_URL=http://localhost:4100
   EXPO_PUBLIC_API_URL=http://localhost:2003
   EXPO_PUBLIC_GRAPHQL_URL=http://localhost:2003/strapi-proxy
   ```

4. **Start the development server**

   ```bash
   pnpm start
   # or
   npm start
   ```

### Running on Different Platforms

**iOS Simulator:**

```bash
pnpm ios
# or press 'i' in the terminal after starting
```

**Android Emulator:**

```bash
pnpm android
# or press 'a' in the terminal after starting
```

**Web Browser:**

```bash
pnpm web
# or press 'w' in the terminal after starting
```

## 🧩 Project Structure

```
yuhuu/
├── app/                          # Application screens (Expo Router)
│   ├── (auth)/                  # Authentication screens
│   │   ├── __tests__/          # Auth screen tests
│   │   ├── login.tsx           # Login screen with auto-scroll
│   │   └── register.tsx        # Register with password confirmation
│   ├── (tabs)/                 # Tab navigation screens
│   │   ├── index.tsx           # Home screen (SafeArea enabled)
│   │   └── profile.tsx         # User profile screen
│   └── _layout.tsx             # Root layout with providers
│
├── components/                   # Reusable components (Atomic Design)
│   ├── atoms/                  # Basic building blocks
│   │   └── badge.tsx
│   ├── molecules/              # Composed components
│   │   └── category-badge.tsx
│   ├── ui/                     # UI components
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   ├── themed-text.tsx         # Theme-aware text component
│   ├── themed-view.tsx         # Theme-aware view component
│   └── __tests__/              # Component tests
│
├── providers/                    # React Context providers
│   ├── AuthProvider.tsx        # Authentication state management
│   └── __tests__/              # Provider tests
│
├── lib/                         # Utilities and helpers
│   ├── api.ts                  # Axios instances with interceptors
│   ├── tokenManager.ts         # JWT token management
│   ├── secureStore.ts          # Secure storage abstraction
│   ├── authz.ts                # Authorization helpers
│   ├── nav.ts                  # Navigation utilities
│   └── __tests__/              # Utility tests
│
├── features/                    # Feature modules
│   ├── bootstrap/              # App initialization
│   ├── profile/                # User profile feature
│   └── roles/                  # Role management
│
├── constants/                   # Constants and theme
│   └── theme.ts                # Color scheme and theme
│
├── hooks/                       # Custom React hooks
│   ├── use-color-scheme.ts     # Theme detection hook
│   └── use-theme-color.ts      # Theme color hook
│
├── assets/                      # Static assets
│   ├── images/                 # Images and icons
│   └── fonts/                  # Custom fonts
│
├── .github/                     # CI/CD workflows
│   ├── workflows/              # GitHub Actions
│   │   ├── build-android.yml   # Android FAT build
│   │   ├── build-ios.yml       # iOS FAT build
│   │   ├── promote-uat.yml     # UAT deployment
│   │   └── promote-prod.yml    # Production deployment
│   └── actions/                # Reusable actions
│
└── scripts/                     # Utility scripts
    └── reset-project.js        # Project reset script
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Files Location

All test files follow the convention `__tests__/*.test.{ts,tsx}`:

- `app/(auth)/__tests__/` - Authentication screen tests
- `components/__tests__/` - Component tests
- `providers/__tests__/` - Provider tests
- `lib/__tests__/` - Utility function tests

### Writing Tests

```typescript
// Example: Login screen test
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

it('should sign in successfully', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
});
```

## 🔐 Authentication Flow

### How Authentication Works

1. **Login/Register**
   - User enters credentials
   - API returns `access_token` and `refresh_token`
   - Tokens are stored securely (SecureStore/localStorage)

2. **Token Management**
   - Access token kept in memory for API calls
   - Persisted to secure storage for app reloads
   - Automatic refresh when token expires (30s buffer)
   - HTTP-only refresh token cookie for web

3. **Protected Routes**
   - Token checked on app load
   - Auto-redirect to login if invalid/expired
   - Role-based access control via `hasRole()` helper

4. **API Calls**
   - All requests via `appApi` include `Authorization: Bearer <token>`
   - Automatic token refresh on 401 responses
   - Request retry after successful refresh

### Backend Requirements

**Auth API (Port 4100)**

```
POST /v1/auth/login
POST /v1/auth/register
POST /v1/auth/refresh
POST /v1/auth/logout
```

**App API (Port 2003)**

```
Your business endpoints (uses Bearer access_token)
```

### Environment Configuration

**Development (.env):**

```bash
EXPO_PUBLIC_ENV=local
EXPO_PUBLIC_AUTH_API_URL=http://localhost:4100
EXPO_PUBLIC_API_URL=http://localhost:2003
```

**UAT/Production:**
Set GitHub Secrets:

- `UAT_GRAPHQL_URL` / `PROD_GRAPHQL_URL`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_AUTH_API_URL`

### CORS Configuration

**Auth API (with credentials):**

```rust
Cors::default()
    .allowed_origin("http://localhost:8081")
    .allowed_methods(vec!["GET","POST","OPTIONS"])
    .supports_credentials()
```

**App API (bearer tokens):**

```rust
Cors::default()
    .allow_any_origin()
    .allowed_methods(vec!["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
    .allowed_headers(vec![
        http::header::CONTENT_TYPE,
        http::header::AUTHORIZATION
    ])
```

## 🏗 Building for Production

### Environment Deployments

This boilerplate includes three deployment environments:

| Environment | Trigger                    | Description                 |
| ----------- | -------------------------- | --------------------------- |
| **FAT**     | Push to`master`            | Automatic build and release |
| **UAT**     | PR with`deploy-uat` label  | User acceptance testing     |
| **PROD**    | PR with`deploy-prod` label | Production release          |

### Android Build

```bash
# Local build
pnpm android

# GitHub Actions build
# Push to master or add label to PR
```

Outputs: APK file available in GitHub Releases

### iOS Build

```bash
# Local build
pnpm ios

# GitHub Actions build
# Push to master or add label to PR
```

Outputs: IPA file available in GitHub Releases

### Build Configuration

Edit `app.config.js`:

```javascript
{
  name: 'YourApp',
  slug: 'your-app',
  version: '1.0.0',
  ios: {
    bundleIdentifier: 'com.yourcompany.yourapp'
  },
  android: {
    package: 'com.yourcompany.yourapp'
  }
}
```

## 🎨 Customization

### 1. App Branding

**Update App Name:**

```javascript
// app.config.js
module.exports = {
  expo: {
    name: "Your App Name",
    slug: "your-app-slug",
  },
};
```

**Update Bundle Identifiers:**

```javascript
// app.config.js
ios: {
  bundleIdentifier: 'com.yourcompany.yourapp'
},
android: {
  package: 'com.yourcompany.yourapp'
}
```

### 2. Theme Customization

**Update Colors:**

```typescript
// constants/theme.ts
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#1e90ff",
    // ... other colors
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#1e90ff",
    // ... other colors
  },
};
```

**Tailwind Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      },
    },
  },
};
```

### 3. App Icon & Splash Screen

- **App Icon**: Replace `assets/images/logo-G.png`
- **Splash Screen**: Update in `app.config.js` under `splash` key
- **Favicon**: Replace `assets/images/favicon.png`

## 📊 Key Features Implementation

### Safe Area Handling

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['top', 'left', 'right']}>
  {/* Your content */}
</SafeAreaView>
```

### Password Confirmation

```typescript
if (password !== confirm) {
  return Alert.alert("Password mismatch", "Passwords do not match.");
}
```

### Auto-Scroll Input to Center

```typescript
const scrollToInput = (inputRef) => {
  inputRef.current.measureLayout(
    scrollViewRef.current,
    (x, y, width, height) => {
      const inputCenterY = y + height / 2;
      const screenCenterY = SCREEN_HEIGHT / 2;
      const scrollToY = inputCenterY - screenCenterY + 100;
      scrollViewRef.current.scrollTo({ y: scrollToY, animated: true });
    },
  );
};
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache:**

```bash
pnpm expo start -c
```

**iOS CocoaPods issues:**

```bash
cd ios && pod install && cd ..
```

**Android build errors:**

```bash
cd android && ./gradlew clean && cd ..
```

**Environment variables not updating:**

```bash
# Restart with cache clear
pnpm expo start -c
```

**Keyboard not showing in iOS simulator:**

- Toggle software keyboard: `Cmd + K`
- Or disconnect hardware keyboard: `Cmd + Shift + K`

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Expo, React Native, and TypeScript**
