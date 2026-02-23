# Deployment Guide

This boilerplate includes GitHub Actions workflows for automated builds and deployments.

## Quick Start

1. Set up an [Expo EAS](https://expo.dev/eas) account
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure your project: `eas build:configure`
5. Update the `eas.projectId` in `app.config.js`

## GitHub Actions Workflows

This boilerplate includes several CI/CD workflows:

### 1. Test Workflow (`test.yml`)

Runs on every push and pull request:

- Linting with ESLint
- Unit tests with Jest
- Coverage reporting

### 2. Android Build Workflow (`build-android.yml`)

Builds Android APK using EAS Build:

- Configured in `eas.json`
- Production profile creates release APK
- Can be triggered manually or on push to main branch

### 3. iOS Build Workflow (`build-ios.yml`)

Builds iOS app using EAS Build:

- Requires Apple Developer account
- Configured in `eas.json`

## Environment Variables

### Local Development

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

### GitHub Secrets

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Required for builds:

- `EXPO_TOKEN` - Your Expo access token (get from https://expo.dev/accounts/[account]/settings/access-tokens)

#### Optional environment-specific variables:

- `DEV_API_URL` - Development API endpoint
- `STAGING_API_URL` - Staging API endpoint
- `PROD_API_URL` - Production API endpoint

## Deployment Strategies

### Option 1: Simple Single Environment

Just build and deploy from your main branch:

1. Push to main
2. GitHub Actions builds the app
3. Deploy via EAS Submit or manual distribution

### Option 2: Multi-Environment Pipeline

Use branch-based environments:

```
develop → staging → main (production)
```

- `develop` - Development builds
- `staging` - UAT/staging builds
- `main` - Production builds

Configure different workflows for each branch with appropriate environment variables.

### Option 3: Promotion-Based Pipeline

Use labels on PRs to promote builds:

1. Build on feature branches
2. Create PR with label (e.g., `promote:staging`)
3. Workflow triggers on label
4. Promote to next environment

## Manual Builds

### Local Build (Development)

```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development
```

### Production Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Build Profiles

Configured in `eas.json`:

- **development** - Development builds with dev client
- **preview** - Preview/staging builds
- **production** - Production release builds

## Submitting to Stores

### iOS App Store

```bash
eas submit --platform ios
```

Requirements:

- Apple Developer account
- App Store Connect app created
- Proper signing certificates

### Google Play Store

```bash
eas submit --platform android
```

Requirements:

- Google Play Developer account
- App created in Play Console
- Signing key (configured in EAS)

## OTA Updates

Expo supports Over-The-Air (OTA) updates for JavaScript changes:

```bash
eas update --branch production
```

Configure update channels in `app.config.js`:

```javascript
updates: {
  url: "https://u.expo.dev/[your-project-id]",
}
```

## Troubleshooting

### Build Fails

1. Check EAS build logs
2. Verify all secrets are set correctly
3. Ensure `eas.projectId` matches your project
4. Check bundle identifiers are unique

### Environment Variables Not Loading

1. Prefix public variables with `EXPO_PUBLIC_`
2. Rebuild after changing env vars (not hot-reloadable)
3. Check `.env` is not gitignored locally

### Signing Issues (iOS)

1. Run `eas credentials` to manage certificates
2. Ensure you have proper Apple Developer permissions
3. Check bundle identifier matches App Store Connect

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
