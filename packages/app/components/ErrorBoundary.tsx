import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error, errorInfo: null};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({error, errorInfo});
    }

    handleReset = () => {
        this.setState({hasError: false, error: null, errorInfo: null});
    };

    render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                    <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#DC2626',
                            marginBottom: 16,
                            textAlign: 'center'
                        }}>
                            Something Went Wrong
                        </Text>

                        <Text style={{
                            fontSize: 16,
                            color: '#374151',
                            marginBottom: 24,
                            textAlign: 'center'
                        }}>
                            The app encountered an error and couldn't continue
                        </Text>

                        <ScrollView style={{
                            backgroundColor: '#F3F4F6',
                            padding: 12,
                            borderRadius: 8,
                            maxHeight: 200,
                            marginBottom: 24
                        }}>
                            <Text style={{
                                fontFamily: 'monospace',
                                fontSize: 12,
                                color: '#DC2626'
                            }}>
                                {this.state.error?.toString()}
                            </Text>
                            {this.state.errorInfo && (
                                <Text style={{
                                    fontFamily: 'monospace',
                                    fontSize: 10,
                                    color: '#6B7280',
                                    marginTop: 8
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={this.handleReset}
                            style={{
                                backgroundColor: '#1e90ff',
                                borderRadius: 8,
                                paddingVertical: 16,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: 16
                            }}>
                                Try Again
                            </Text>
                        </TouchableOpacity>

                        <Text style={{
                            fontSize: 12,
                            color: '#9CA3AF',
                            marginTop: 16,
                            textAlign: 'center'
                        }}>
                            If this persists, please contact support
                        </Text>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}
