/**
 * Rijen voor lijsten: EventRow (afspraak) en TaskRow (taak).
 */

import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography, usePalette } from '@/design/theme';

export function EventRow({
  time,
  title,
  subtitle,
  accentColor,
  onPress,
}: {
  time: string;
  title: string;
  subtitle?: string;
  accentColor: string;
  onPress?: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.eventRow, pressed && onPress ? { opacity: 0.7 } : null]}
    >
      <View style={styles.timeCol}>
        <Text style={[typography.label, { color: p.text }]}>{time}</Text>
      </View>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.eventBody}>
        <Text style={[typography.body, { color: p.text, fontWeight: '600' }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: p.textSoft }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Feather name="chevron-right" size={18} color={p.textFaint} /> : null}
    </Pressable>
  );
}

export function TaskRow({
  title,
  meta,
  done,
  accentColor,
  onToggle,
  onPress,
}: {
  title: string;
  meta?: string;
  done: boolean;
  accentColor?: string;
  onToggle: () => void;
  onPress?: () => void;
}) {
  const p = usePalette();
  return (
    <View style={styles.taskRow}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={title}
        hitSlop={10}
        style={[
          styles.check,
          {
            borderColor: done ? p.success : p.borderStrong,
            backgroundColor: done ? p.success : 'transparent',
          },
        ]}
      >
        {done ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
      </Pressable>
      <Pressable
        onPress={onPress}
        style={styles.taskBody}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <Text
          style={[
            typography.body,
            {
              color: done ? p.textFaint : p.text,
              fontWeight: '500',
              textDecorationLine: done ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {meta ? (
          <Text style={[typography.caption, { color: p.textSoft }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </Pressable>
      {accentColor ? <View style={[styles.dot, { backgroundColor: accentColor }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeCol: { width: 46 },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: radius.pill, minHeight: 34 },
  eventBody: { flex: 1, gap: 2 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBody: { flex: 1, gap: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
