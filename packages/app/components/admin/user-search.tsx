import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useState} from 'react';
import {useColorScheme, Colors, GlassInput, GlassCard} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {useUserSearchQuery, type UserSearchResult} from '@/features/admin/api';

/**
 * UserSearch component - Search for users by name
 *
 * This is the APP-SPECIFIC version with API integration.
 * Different from the generic molecules/user-search.tsx in the shared library.
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles user search input and result selection
 * - Open/Closed: Can be extended with filters without modification
 * - Dependency Inversion: Parent decides what to do with selected user
 */

type UserSearchProps = {
    onSearch: (user: { id: number; username: string }) => void;
    testID?: string;
};

export function UserSearch({
                               onSearch,
                               testID
                           }: UserSearchProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);

    const {data: searchResults = [], isLoading, error} = useUserSearchQuery(searchTerm);

    const getErrorMessage = (err: any): string => {
        if (!err) return '';

        // Check for 403 Forbidden
        if (err?.response?.status === 403) {
            return t('admin.adminAccessRequired');
        }

        // Check for 400 Bad Request
        if (err?.response?.status === 400) {
            return t('admin.searchMinChars');
        }

        // Generic error
        return t('admin.searchFailed');
    };

    const handleChangeText = (text: string) => {
        setSearchTerm(text);
        setShowResults(text.trim().length >= 2);
    };

    const handleSelectUser = (user: UserSearchResult) => {
        // Pass user data to parent
        onSearch({
            id: user.user_id, // This is the users.id that the accordions need
            username: user.middle_name || user.phone || `User ${user.user_id}`,
        });
        // Clear search and hide results
        setSearchTerm('');
        setShowResults(false);
    };

    return (
        <View testID={testID} style={styles.container}>
            <GlassInput
                testID="search-input"
                variant="tinted"
                borderRadius={8}
                placeholder={t('admin.searchPlaceholder') || 'Search by name...'}
                value={searchTerm}
                onChangeText={handleChangeText}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
            />

            {/* Validation Hint */}
            {searchTerm.length > 0 && searchTerm.length < 2 && (
                <View style={styles.hintContainer}>
                    <Text style={[styles.hintText, {color: Colors[scheme ?? 'light'].icon}]}>
                        {t('admin.searchMinChars')}
                    </Text>
                </View>
            )}

            {/* Error Display */}
            {error && searchTerm.length >= 2 && (
                <GlassCard
                    variant="ultra-thin"
                    borderRadius={8}
                    style={styles.errorContainer}
                >
                    <Text style={styles.errorText}>
                        {getErrorMessage(error)}
                    </Text>
                </GlassCard>
            )}

            {/* Results List */}
            {showResults && searchTerm.length >= 2 && !error && (
                <GlassCard
                    variant="tinted"
                    borderRadius={8}
                    enableShadow={true}
                    shadowLevel="medium"
                    style={styles.resultsContainer}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors[scheme ?? 'light'].tint} />
                            <Text style={[styles.loadingText, {color: Colors[scheme ?? 'light'].icon}]}>
                                {t('common.loading') || 'Searching...'}
                            </Text>
                        </View>
                    ) : searchResults.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, {color: Colors[scheme ?? 'light'].icon}]}>
                                {t('admin.noUsersFound') || 'No users found'}
                            </Text>
                        </View>
                    ) : (
                        searchResults.map((user) => (
                            <Pressable
                                key={user.id}
                                testID={`user-result-${user.id}`}
                                style={[
                                    styles.resultItem,
                                    {
                                        borderBottomColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB',
                                    },
                                ]}
                                onPress={() => handleSelectUser(user)}
                            >
                                <Text style={[styles.resultName, {color: Colors[scheme ?? 'light'].text}]}>
                                    {user.middle_name || 'Unnamed'}
                                </Text>
                                {user.phone && (
                                    <Text style={[styles.resultPhone, {color: Colors[scheme ?? 'light'].icon}]}>
                                        {user.phone}
                                    </Text>
                                )}
                                <Text style={[styles.resultId, {color: Colors[scheme ?? 'light'].icon}]}>
                                    ID: {user.user_id}
                                </Text>
                            </Pressable>
                        ))
                    )}
                </GlassCard>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        height: 48,
        fontSize: 16,
        marginBottom: 4,
    },
    resultsContainer: {
        maxHeight: 300,
        marginTop: 4,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultPhone: {
        fontSize: 14,
        marginBottom: 2,
    },
    resultId: {
        fontSize: 12,
    },
    hintContainer: {
        padding: 8,
        marginTop: 4,
    },
    hintText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    errorContainer: {
        padding: 12,
        marginTop: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        fontWeight: '500',
    },
});
