/**
 * Formulier-bouwstenen voor de modal-schermen: FormScreen-wrapper, tekstveld,
 * tijdveld, datumveld (stepper — geen native picker, werkt overal), segmented
 * control, keuze-chips en toggle. Bewust licht en cross-platform.
 */

import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadow, spacing, typography, usePalette } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { addDays, isoWeekday, parseIso } from '@/lib/date';

export function FormScreen({
  title,
  onClose,
  onSave,
  saveLabel = nl.common.save,
  onDelete,
  children,
  saveDisabled = false,
}: {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  onDelete?: () => void;
  children: ReactNode;
  saveDisabled?: boolean;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.formRoot, { backgroundColor: p.bg }]}>
      <View style={[styles.formHeader, { paddingTop: insets.top + spacing.sm, borderColor: p.border }]}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={nl.common.cancel} hitSlop={10}>
          <Text style={[typography.body, { color: p.textSoft }]}>{nl.common.cancel}</Text>
        </Pressable>
        <Text style={[typography.heading, { color: p.text }]} numberOfLines={1}>
          {title}
        </Text>
        {onSave ? (
          <Pressable onPress={onSave} disabled={saveDisabled} accessibilityRole="button" hitSlop={10}>
            <Text
              style={[
                typography.label,
                { color: saveDisabled ? p.textFaint : p.parentA.text, fontSize: 15 },
              ]}
            >
              {saveLabel}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxxl, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        {onDelete ? (
          <Pressable onPress={onDelete} accessibilityRole="button" style={styles.deleteBtn}>
            <Feather name="trash-2" size={16} color={p.parentA.text} />
            <Text style={[typography.label, { color: p.parentA.text }]}>{nl.common.delete}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  const p = usePalette();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.label, { color: p.textSoft }]}>{label}</Text>
      {children}
      {hint ? <Text style={[typography.caption, { color: p.textFaint }]}>{hint}</Text> : null}
    </View>
  );
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  autoFocus = false,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const p = usePalette();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={p.textFaint}
      multiline={multiline}
      autoFocus={autoFocus}
      style={[
        styles.input,
        {
          backgroundColor: p.surface,
          borderColor: p.border,
          color: p.text,
          minHeight: multiline ? 88 : 52,
          textAlignVertical: multiline ? 'top' : 'center',
        },
      ]}
    />
  );
}

/** Tijdveld HH:MM met lichte maskering. Leeg toegestaan. */
export function TimeField({
  value,
  onChange,
  placeholder = 'uu:mm',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const p = usePalette();
  const handle = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 4);
    let out = digits;
    if (digits.length >= 3) out = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    onChange(out);
  };
  return (
    <TextInput
      value={value}
      onChangeText={handle}
      placeholder={placeholder}
      placeholderTextColor={p.textFaint}
      keyboardType="number-pad"
      maxLength={5}
      style={[styles.input, styles.timeInput, { backgroundColor: p.surface, borderColor: p.border, color: p.text }]}
    />
  );
}

/** Datumveld als stepper (‹ di 22 jul ›). Geen native picker → werkt op web. */
export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const p = usePalette();
  const d = parseIso(value);
  const label = `${nl.schedule.weekdays[isoWeekday(value) - 1]} ${d.getUTCDate()} ${nl.schedule.monthsShort[d.getUTCMonth()]}`;
  return (
    <View style={[styles.stepper, { backgroundColor: p.surface, borderColor: p.border }]}>
      <Pressable onPress={() => onChange(addDays(value, -1))} hitSlop={10} accessibilityLabel={nl.schedule.prevDay} accessibilityRole="button">
        <Feather name="chevron-left" size={22} color={p.text} />
      </Pressable>
      <Text style={[typography.body, { color: p.text, fontWeight: '600', textTransform: 'capitalize' }]}>{label}</Text>
      <Pressable onPress={() => onChange(addDays(value, 1))} hitSlop={10} accessibilityLabel={nl.schedule.nextDay} accessibilityRole="button">
        <Feather name="chevron-right" size={22} color={p.text} />
      </Pressable>
    </View>
  );
}

export interface Option {
  id: string;
  label: string;
  color?: string;
}

/** Segmented control — één keuze uit weinig opties. */
export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const p = usePalette();
  return (
    <View style={[styles.segment, { backgroundColor: p.surfaceSunken, borderColor: p.border }]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && { backgroundColor: p.surface }, active && (shadow.sm as object)]}
          >
            {o.color ? <View style={[styles.segDot, { backgroundColor: o.color }]} /> : null}
            <Text style={[typography.label, { color: active ? p.text : p.textSoft }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Keuze-chips — enkel of meervoudig (bv. kinderen). */
export function OptionChips({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  multi?: boolean;
}) {
  const p = usePalette();
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <Pressable
            key={o.id}
            onPress={() => onToggle(o.id)}
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ selected: active, checked: active }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? (o.color ?? p.text) : p.surface,
                borderColor: active ? (o.color ?? p.text) : p.border,
              },
            ]}
          >
            <Text style={[typography.label, { color: active ? '#FFFFFF' : p.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const p = usePalette();
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} style={styles.toggleRow}>
      <Text style={[typography.body, { color: p.text, flex: 1 }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: value ? p.success : p.surfaceSunken, borderColor: p.border }]}>
        <View style={[styles.knob, { alignSelf: value ? 'flex-end' : 'flex-start', backgroundColor: '#FFFFFF' }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  formRoot: { flex: 1 },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  timeInput: { width: 110, textAlign: 'center', letterSpacing: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segDot: { width: 10, height: 10, borderRadius: 5 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  track: { width: 48, height: 28, borderRadius: 14, borderWidth: 1, padding: 2, justifyContent: 'center' },
  knob: { width: 22, height: 22, borderRadius: 11 },
});
