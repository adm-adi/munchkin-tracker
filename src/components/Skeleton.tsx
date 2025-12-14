import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({
    width = '100%',
    height = 20,
    borderRadius = Radius.md,
    style,
}: SkeletonProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                { width, height, borderRadius, opacity },
                style,
            ]}
        />
    );
}

// Card skeleton for player cards
export function PlayerCardSkeleton() {
    return (
        <View style={styles.cardSkeleton}>
            <View style={styles.cardHeader}>
                <Skeleton width={50} height={50} borderRadius={25} />
                <View style={styles.cardInfo}>
                    <Skeleton width={120} height={18} />
                    <Skeleton width={80} height={14} style={{ marginTop: 4 }} />
                </View>
            </View>
            <View style={styles.cardStats}>
                <Skeleton width={60} height={30} />
                <Skeleton width={60} height={30} />
            </View>
        </View>
    );
}

// List skeleton
export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <View style={styles.listSkeleton}>
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton key={i} height={60} style={{ marginBottom: Spacing.sm }} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: MunchkinColors.backgroundCard,
    },
    cardSkeleton: {
        backgroundColor: MunchkinColors.backgroundMedium,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    cardInfo: {
        flex: 1,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: Spacing.md,
    },
    listSkeleton: {
        padding: Spacing.md,
    },
});
