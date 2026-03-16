import React from 'react';
import {ThemedText, useColorScheme, Colors} from '@yuhuu/components';

interface AccordionEmptyStateProps {
    message: string;
}

export function AccordionEmptyState({message}: AccordionEmptyStateProps) {
    const scheme = useColorScheme() ?? 'light';

    return (
        <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
            {message}
        </ThemedText>
    );
}
