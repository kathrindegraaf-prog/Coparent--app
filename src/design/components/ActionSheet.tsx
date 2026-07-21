/**
 * ActionSheet — eenvoudige keuzelijst die vanaf onder verschijnt. Voor de
 * "Toevoegen"-knop. Werkt op mobiel en web (RN Modal).
 */

import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, typography, usePalette } from '@/design/theme';

export interface SheetAction {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

export function ActionSheet({
  visible,
  onClose,
  title,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: p.scrim }]} onPress={onClose} accessibilityLabel="Sluiten">
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: p.surface, borderColor: p.border, paddingBottom: insets.bottom + spacing.md },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.grabber, { backgroundColor: p.borderStrong }]} />
          {title ? <Text style={[typography.label, { color: p.textSoft, marginBottom: spacing.sm }]}>{title}</Text> : null}
          {actions.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => {
                onClose();
                a.onPress();
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, { borderColor: p.border }, pressed && { backgroundColor: p.surfaceAlt }]}
            >
              <Feather name={a.icon} size={20} color={p.text} />
              <Text style={[typography.bodyLg, { color: p.text }]}>{a.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  grabber: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: spacing.md },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
});
