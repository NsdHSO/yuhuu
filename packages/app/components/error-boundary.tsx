import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View} from 'react-native';
import {ThemedText} from './themed-text';
import {i18n} from '@yuhuu/i18n';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, error: null};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, error};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({hasError: false, error: null});
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
                    <ThemedText type="title" style={{marginBottom: 16}}>{i18n.t('errors.boundaryTitle')}</ThemedText>
                    <ThemedText style={{textAlign: 'center', opacity: 0.7, marginBottom: 20}}>
                        {this.state.error?.message || i18n.t('errors.boundaryDefault')}
                    </ThemedText>
                    <ThemedText
                        style={{textAlign: 'center', color: '#1e90ff'}}
                        onPress={this.handleReset}
                    >
                        {i18n.t('errors.boundaryRetry')}
                    </ThemedText>
                </View>
            );
        }

        return this.props.children;
    }
}
