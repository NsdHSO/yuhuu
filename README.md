# Yuhuu - React Native Boilerplate 👋

A production-ready boilerplate for building cross-platform mobile and web applications with React Native and Expo.

## Features

✨ **Cross-Platform**: iOS, Android, and Web support
🎨 **NativeWind**: Tailwind CSS for React Native
📱 **Expo Router**: File-based navigation
⚡ **TypeScript**: Full type safety
🧪 **Testing**: Jest with React Native Testing Library
🚀 **CI/CD**: GitHub Actions workflows for automated builds
🎯 **Modern Stack**: React 19, React Native 0.81, Expo 54

## Tech Stack

- **Framework**: Expo 54 with React Native 0.81
- **UI**: NativeWind (Tailwind CSS v4)
- **Navigation**: Expo Router
- **State Management**: React hooks (add your preferred solution)
- **Testing**: Jest + React Native Testing Library
- **Language**: TypeScript 5.9
- **Package Manager**: pnpm (recommended) or npm

## Get Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- iOS: Xcode and CocoaPods (for iOS development)
- Android: Android Studio and SDK (for Android development)

### Installation

1. Clone or download this boilerplate

2. Install dependencies

   ```bash
   pnpm install
   # or
   npm install
   ```

3. Start the development server

   ```bash
   pnpm start
   # or
   npm start
   ```

In the output, you'll find options to open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Web browser](https://docs.expo.dev/workflow/web/)

### Development

You can start developing by editing files inside the **app** directory. This project
uses [file-based routing](https://docs.expo.dev/router/introduction).

Key directories:

- `app/` - Application screens and routes
- `components/` - Reusable components (atomic design pattern)
- `constants/` - Theme colors and constants
- `hooks/` - Custom React hooks
- `assets/` - Images, fonts, and other static files

## Building

### iOS

```bash
pnpm ios
# or
npm run ios
```

### Android

```bash
pnpm android
# or
npm run android
```

### Web

```bash
pnpm web
# or
npm run web
```

## Testing

Run tests:

```bash
pnpm test
# or
npm test
```

Run tests in watch mode:

```bash
pnpm test:watch
# or
npm run test:watch
```

Generate coverage report:

```bash
pnpm test:coverage
# or
npm run test:coverage
```

## Production Builds

This boilerplate includes GitHub Actions workflows for automated builds:

- **Android**: APK builds via EAS Build
- **iOS**: App Store builds via EAS Build

Configure your EAS project ID in `app.config.js` and set up GitHub Secrets for environment variables.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
yuhuu/
├── app/                    # Application screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   ├── _layout.tsx        # Root layout
│   └── modal.tsx          # Example modal
├── components/            # Reusable components
│   ├── atoms/            # Basic building blocks
│   ├── molecules/        # Composed components
│   └── ui/               # UI components
├── constants/            # Theme and constants
├── hooks/                # Custom hooks
├── assets/               # Static assets
├── ios/                  # iOS native code
├── .github/              # CI/CD workflows
└── scripts/              # Utility scripts
```

## Environment & backends

This app talks to two backends:

- Auth API (port 4100): issues access_token and httpOnly refresh_token cookie
- App API (port 2003): your business endpoints (uses Bearer access_token)

### 1) .env configuration (required)

Copy `.env.example` to `.env` and set the two API URLs. Do not use `0.0.0.0` — always use `localhost` or a resolvable
host.

```bash
cp .env.example .env
```

```
# .env (development)
EXPO_PUBLIC_ENV=local
EXPO_PUBLIC_AUTH_API_URL=http://localhost:4100
EXPO_PUBLIC_API_URL=http://localhost:2003
```

After changing `.env`, fully restart Expo so env is re-read:

```bash
pnpm expo start -c
```

### 2) Auth API cookie settings

For browsers, the refresh_token is an httpOnly cookie. Configure it like this:

- Development (HTTP): `SameSite=Lax`, `Secure=false`
- Production (HTTPS): `SameSite=None`, `Secure=true`

Actix example (dev):

```rust
let cookie = Cookie::build("refresh_token", token)
    .path("/")
    .http_only(true)
    .same_site(SameSite::Lax)
    .secure(false)
    .max_age(time::Duration::days(30))
    .finish();
```

### 3) CORS

- Auth API (4100) must allow credentials from the web origin:

```rust
App::new().wrap(
  Cors::default()
    .allowed_origin("http://localhost:8081")
    .allowed_methods(vec!["GET","POST","OPTIONS"])
    .allowed_headers(vec![http::header::CONTENT_TYPE, http::header::ACCEPT])
    .supports_credentials()
)
```

- App API (2003) typically does NOT use cookies. Easiest dev config:

```rust
App::new().wrap(
  Cors::default()
    .allow_any_origin()
    .allowed_methods(vec!["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
    .allowed_headers(vec![http::header::CONTENT_TYPE, http::header::ACCEPT, http::header::AUTHORIZATION])
)
```

Ensure CORS is wrapped on the scope that serves `/v1`, and that OPTIONS is not blocked by auth.

### 4) Verify locally

- Refresh (should return 200):

```bash
curl -i -X POST http://localhost:4100/v1/auth/refresh \
  -H 'Origin: http://localhost:8081' \
  --cookie 'refresh_token=...'
```

- Preflight to app API (should return 200/204 with ACAO):

```bash
curl -i -X OPTIONS http://localhost:2003/v1/me \
  -H 'Origin: http://localhost:8081' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

### 5) Token handling in the app

- On login or refresh, the app stores `access_token` in memory and (for convenience) persists it:
    - Native: Expo SecureStore
    - Web: `localStorage`
- Every request made via `appApi` automatically adds `Authorization: Bearer <access_token>`.

### Common pitfalls

- Using `0.0.0.0` in `.env`. Browsers can’t reach that host. Use `http://localhost:<port>`.
- Secure cookie on HTTP (dev). Browsers drop it. Use `Secure=false` + `SameSite=Lax` in dev.
- CORS preflight returns 401. Make sure OPTIONS is handled before auth and `Authorization` is listed in
  `Access-Control-Allow-Headers`.

## Customization

1. **Update App Name**: Change `name` and `slug` in `app.config.js`
2. **Bundle Identifiers**: Update iOS and Android package names in `app.config.js`
3. **App Icon**: Replace images in `assets/images/`
4. **Theme**: Modify colors in `constants/theme.ts` and `tailwind.config.js`
5. **EAS Project**: Set your EAS project ID in `app.config.js`

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [NativeWind documentation](https://www.nativewind.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)

## License

This project is open source and available under the MIT License.
