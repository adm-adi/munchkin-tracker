import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);

        // In production, send to crash reporting service
        // Sentry.captureException(error);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Text style={styles.emoji}>💀</Text>
                    <Text style={styles.title}>¡Algo salió mal!</Text>
                    <Text style={styles.message}>
                        {this.state.error?.message || 'Error desconocido'}
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Text style={styles.buttonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MunchkinColors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.danger,
        marginBottom: Spacing.md,
    },
    message: {
        fontSize: 14,
        color: MunchkinColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    button: {
        backgroundColor: MunchkinColors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
    },
    buttonText: {
        color: MunchkinColors.backgroundDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
