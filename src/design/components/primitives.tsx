/**
 * Basiscomponenten: Card, SectionHeader, EmptyState, Divider, Badge.
 */

import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { radius, shadow, spacing, typography, usePalette } from '@/design/theme';

export function Card({
  children,
  style,
  padded = true,
  sunken = false,
}: {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  sunken?: boolean;
}) {
  const p = usePalette();
  return (
    <View
      style={[
        {
          backgroundColor: sunken ? p.surfaceSunken : p.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: p.border,
          padding: padded ? spacing.lg : 0,
        },
        !sunken && (shadow.sm as ViewStyle),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const p = usePalette();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[typography.overline, { color: p.textSoft }]}>{title}</Text>
      {action}
    </View>
  );
}

export function Divider() {
  const p = usePalette();
  return <View style={{ height: 1, backgroundColor: p.border }} />;
}

export function Badge({
  label,
  color,
  bg,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  const p = usePalette();
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg ?? p.surfaceAlt },
      ]}
    >
      <Text style={[typography.caption, { color: color ?? p.textSoft, fontWeight: '600' }]}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({
  icon = 'inbox',
  text,
}: {
  icon?: keyof typeof Feather.glyphMap;
  text: string;
}) {
  const p = usePalette();
  return (
    <View style={styles.empty}>
      <Feather name={icon} size={20} color={p.textFaint} />
      <Text style={[typography.body, { color: p.textSoft, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
