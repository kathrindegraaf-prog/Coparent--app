/**
 * Button — primary (max één per scherm), secondary, ghost en danger.
 */

import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { radius, spacing, typography, usePalette } from '@/design/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}) {
  const p = usePalette();

  const bg =
    variant === 'primary'
      ? p.text
      : variant === 'secondary'
        ? p.surfaceAlt
        : variant === 'danger'
          ? p.parentA.soft
          : 'transparent';

  const fg =
    variant === 'primary'
      ? p.bg
      : variant === 'danger'
        ? p.parentA.text
        : p.text;

  const border =
    variant === 'secondary'
      ? p.borderStrong
      : variant === 'ghost'
        ? 'transparent'
        : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {icon && <Feather name={icon} size={17} color={fg} />}
      <Text style={[typography.label, { color: fg, fontSize: 15 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
});
