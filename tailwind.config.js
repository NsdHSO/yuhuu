const categoryColors = require('./theme/category-colors');

module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            // Category colors for article badges
            colors: categoryColors,

            // Accessible font sizes (minimum 16px for body text per WCAG)
            fontSize: {
                // Small text - use sparingly, ensure proper contrast
                'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],    // 12px
                'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],   // 14px

                // Base/body text - minimum recommended size
                'base': ['1rem', { lineHeight: '1.625', letterSpacing: '0' }],        // 16px - WCAG compliant
                'lg': ['1.125rem', { lineHeight: '1.625', letterSpacing: '0' }],      // 18px

                // Large text - better for accessibility
                'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],   // 20px
                '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],   // 24px
                '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }], // 30px
                '4xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }], // 36px
                '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],     // 48px
                '6xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.03em' }], // 60px
                '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],   // 72px
                '8xl': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],    // 96px
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }],       // 128px
            },

            // Accessible line heights (minimum 1.5 for body text per WCAG)
            lineHeight: {
                'none': '1',
                'tight': '1.25',
                'snug': '1.375',
                'normal': '1.5',      // WCAG minimum
                'relaxed': '1.625',   // Recommended for body text
                'loose': '1.75',
                'extra-loose': '2',
            },

            // Letter spacing for improved readability
            letterSpacing: {
                'tightest': '-0.05em',
                'tighter': '-0.03em',
                'tight': '-0.02em',
                'normal': '0',
                'wide': '0.01em',
                'wider': '0.02em',
                'widest': '0.05em',
                'ultra-wide': '0.1em',
            },

            // Font weights - avoid extremes for better readability
            fontWeight: {
                'thin': '300',        // Use sparingly
                'normal': '400',      // Body text minimum
                'medium': '500',      // Good for emphasis
                'semibold': '600',    // Headings, strong emphasis
                'bold': '700',        // Strong headings
                'extrabold': '800',   // Display text only
            },

            // Accessible font families with proper fallbacks
            fontFamily: {
                'sans': [
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    '"Noto Sans"',
                    'sans-serif',
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
                'serif': [
                    'ui-serif',
                    'Georgia',
                    'Cambria',
                    '"Times New Roman"',
                    'Times',
                    'serif',
                ],
                'mono': [
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    '"Liberation Mono"',
                    '"Courier New"',
                    'monospace',
                ],
            },
        },
    },
    plugins: [],
};
