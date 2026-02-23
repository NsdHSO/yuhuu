import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

// Accept plain string URLs in tests and at runtime, while casting to Href for Link
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({
                                 href,
                                 ...rest
                             }: Props) {
    return (
        <Link
            target="_blank"
            {...rest}
            href={href as unknown as Href}
            onPress={async (event) => {
                if (process.env.EXPO_OS !== 'web') {
                    // Prevent the default behavior of linking to the default browser on native.
                    event.preventDefault();
                    // Open the link in an in-app browser.
                    await openBrowserAsync(href, {
                        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                    });
                }
            }}
        />
    );
}
