/**
 * Subtiele beweging met de ingebouwde Animated API (geen extra dependencies).
 * - FadeInView: zacht infaden + klein omhoog schuiven bij het verschijnen.
 * - PressableScale: licht "indrukken" bij tikken, voor tactiele rust.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, type PressableProps, type ViewStyle } from 'react-native';
import { motion } from '@/design/theme';

export function FadeInView({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.base, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: motion.base, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, delay]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  ...rest
}: PressableProps & { children: ReactNode; style?: ViewStyle; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <Pressable
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
