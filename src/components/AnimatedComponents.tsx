/**
 * Animated card wrapper with entrance animation
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedCardProps {
    children: React.ReactNode;
    index?: number;
    delay?: number;
    style?: ViewStyle;
}

export function AnimatedCard({
    children,
    index = 0,
    delay = 50,
    style
}: AnimatedCardProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const scale = useSharedValue(0.95);

    useEffect(() => {
        const entryDelay = index * delay;

        opacity.value = withDelay(
            entryDelay,
            withTiming(1, { duration: 300 })
        );

        translateY.value = withDelay(
            entryDelay,
            withSpring(0, {
                damping: 15,
                stiffness: 100,
            })
        );

        scale.value = withDelay(
            entryDelay,
            withSpring(1, {
                damping: 15,
                stiffness: 100,
            })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
}

interface AnimatedButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: ViewStyle;
    disabled?: boolean;
}

export function AnimatedPressable({
    children,
    onPress,
    style,
    disabled = false,
}: AnimatedButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, {
            damping: 10,
            stiffness: 400,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 10,
            stiffness: 400,
        });
    };

    return (
        <Animated.View style={[animatedStyle, style]}>
            <Animated.View
                onTouchStart={disabled ? undefined : handlePressIn}
                onTouchEnd={disabled ? undefined : () => {
                    handlePressOut();
                    onPress();
                }}
                onTouchCancel={handlePressOut}
            >
                {children}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Just a wrapper, styles applied via props
    },
});
