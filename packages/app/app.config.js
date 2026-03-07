module.exports = {
  expo: {
    name: "Yuhuu",
    slug: "Yuhuu",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo-G.png",
    scheme: "yuhuu",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.yuhuu",
      infoPlist: {
        NSFaceIDUsageDescription:
          "Allow Yuhuu to use Face ID for quick and secure sign-in.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/logo-G.png",
        backgroundImage: "./assets/images/logo-G.png",
        monochromeImage: "./assets/images/logo-G.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "ro.yuhuu.app",
      versionCode: 1,
      permissions: ["INTERNET", "ACCESS_NETWORK_STATE"],
      // Allow HTTP in non-production builds so FAT/UAT can use test endpoints without HTTPS
      usesCleartextTraffic: process.env.EXPO_PUBLIC_ENV !== "production",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-localization",
      [
        "expo-local-authentication",
        {
          faceIDPermission:
            "Allow Yuhuu to use Face ID for quick and secure sign-in.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo-G.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false, // Disabled - incompatible with RN 0.81.5
    },
    extra: {
      router: {},
      eas: {
        // TODO: Replace with your EAS project ID
        // projectId: "your-project-id-here",
      },
      // Read environment variables at build time and bundle them into the app
      EXPO_PUBLIC_GRAPHQL_URL:
        process.env.EXPO_PUBLIC_GRAPHQL_URL ||
        "http://localhost:2003/strapi-proxy",
      EXPO_PUBLIC_API_URL:
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:2003",
      EXPO_PUBLIC_AUTH_API_URL:
        process.env.EXPO_PUBLIC_AUTH_API_URL || "http://localhost:4100",
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV || "local",
    },
    owner: "nsdhso",
  },
};
// Test cache optimizations: pnpm-lock.yaml in cache keys - 20260302060430
