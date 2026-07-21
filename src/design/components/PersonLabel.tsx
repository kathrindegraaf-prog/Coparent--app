/**
 * PersonLabel — een ouder als gekleurde avatar met initiaal, optioneel met naam.
 */

import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography, usePalette } from '@/design/theme';

export function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function PersonLabel({
  name,
  color,
  size = 28,
  showName = true,
  suffix,
}: {
  name: string;
  color: string;
  size?: number;
  showName?: boolean;
  suffix?: string;
}) {
  const p = usePalette();
  return (
    <View style={styles.row}>
      <Avatar name={name} color={color} size={size} />
      {showName && (
        <Text style={[typography.body, { color: p.text, fontWeight: '600' }]}>
          {name}
          {suffix ? <Text style={{ color: p.textSoft, fontWeight: '400' }}>{suffix}</Text> : null}
        </Text>
      )}
    </View>
  );
}

/** Gekleurde chip met naam — voor compacte weergave. */
export function PersonChip({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#FFFFFF', fontWeight: '700' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});
