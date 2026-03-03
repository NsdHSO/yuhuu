import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ReactNode, useState} from 'react';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {IconSymbol} from '../ui/icon-symbol';

type AccordionProps = {
    title: string;
    children: ReactNode;
    initialExpanded?: boolean;
    testID?: string;
};

export function Accordion({
                              title,
                              children,
                              initialExpanded = false,
                              testID
                          }: AccordionProps) {
    const scheme = useColorScheme();
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View testID={testID} style={styles.container}>
            <Pressable
                testID={testID ? `${testID}-header` : 'accordion-header'}
                accessible={true}
                style={[
                    styles.header,
                    {
                        backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
                    },
                ]}
                onPress={toggleExpanded}
            >
                <Text style={[styles.title, {color: Colors[scheme ?? 'light'].text}]}>
                    {title}
                </Text>

                <IconSymbol
                    testID={testID ? `${testID}-icon` : 'accordion-icon'}
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={20}
                    color={Colors[scheme ?? 'light'].icon}
                />
            </Pressable>

            {isExpanded && (
                <View
                    style={[
                        styles.content,
                        {
                            backgroundColor: scheme === 'dark' ? '#111827' : '#FFFFFF',
                        },
                    ]}
                >
                    {children}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        paddingTop: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
});
