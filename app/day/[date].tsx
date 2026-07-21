import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePalette, radius, spacing, typography } from '@/design/theme';
import { useSchedule, parentInfo } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';
import { isoWeekday, parseIso } from '@/lib/date';

export default function DayScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const schedule = useSchedule();

  const assignment = date ? schedule.assignment(date) : null;
  const main = parentInfo(schedule.snapshot, assignment?.parentId ?? null);
  const handoverDay = assignment?.handover
    ? parentInfo(schedule.snapshot, assignment.handover.dayParentId)
    : null;

  const wd = date ? isoWeekday(date) : 1;
  const dayLabel = date
    ? `${nl.schedule.weekdays[wd - 1]} ${parseIso(date).getUTCDate()} ${
        nl.schedule.months[parseIso(date).getUTCMonth()]
      }`
    : '';

  const whoText = !main
    ? nl.schedule.unassigned
    : assignment?.handover
      ? nl.day.dayThenEvening(handoverDay?.name ?? nl.schedule.unassigned, main.name)
      : nl.day.withParent(main.name);

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={[styles.dayLabel, { color: palette.text }]}>{dayLabel}</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={[styles.close, { color: palette.textSoft }]}>✕</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: main?.color ?? palette.surfaceAlt, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.whoLabel, { color: main ? '#FFFFFF' : palette.textSoft }]}>
          {whoText}
        </Text>
        {assignment?.isWeekend && (
          <Text style={[styles.tag, { color: main ? '#FFFFFF' : palette.textSoft }]}>
            {nl.day.weekendBlock}
          </Text>
        )}
        {assignment?.isStar && (
          <Text style={[styles.tag, { color: palette.star }]}>★ {nl.schedule.extraMoment}</Text>
        )}
        {assignment?.overridden && (
          <Text style={[styles.tag, { color: main ? '#FFFFFF' : palette.textSoft }]}>
            {nl.day.overridden}
          </Text>
        )}
      </View>

      <Text style={[styles.hint, { color: palette.textSoft }]}>
        In de volgende stap kun je hier een dag toewijzen, een extra contactmoment markeren en een
        kort bericht plaatsen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  dayLabel: { ...typography.title, textTransform: 'capitalize' },
  close: { fontSize: 20 },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  whoLabel: { ...typography.heading, fontSize: 20 },
  tag: { ...typography.body },
  hint: { ...typography.body, marginTop: spacing.xl, lineHeight: 21 },
});
