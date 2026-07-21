/**
 * Maandraster — het hart van functie 1. Strak blokkenschema, kleur per ouder,
 * doordeweeks en weekend visueel gescheiden (de za/zo-kolommen zitten in een
 * eigen band). Maand vooruit/terug via de kop.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette, radius, spacing, typography } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { monthMatrix } from '@/lib/date';
import { DayCell } from './DayCell';
import type { UseSchedule } from './useSchedule';

interface Props {
  schedule: UseSchedule;
  today: string;
  onSelectDay: (date: string) => void;
}

export function MonthGrid({ schedule, today, onSelectDay }: Props) {
  const palette = usePalette();
  const { year, month0, assignment, snapshot } = schedule;
  const weeks = monthMatrix(year, month0);
  const monthName = nl.schedule.months[month0];

  return (
    <View>
      {/* Kop met maandnavigatie */}
      <View style={styles.header}>
        <Pressable
          onPress={schedule.goPrevMonth}
          accessibilityRole="button"
          accessibilityLabel={nl.schedule.prevMonth}
          hitSlop={12}
          style={({ pressed }) => [styles.navBtn, { borderColor: palette.border }, pressed && styles.pressed]}
        >
          <Text style={[styles.navChevron, { color: palette.text }]}>‹</Text>
        </Pressable>

        <Pressable onPress={schedule.goToday} accessibilityRole="button">
          <Text style={[styles.monthTitle, { color: palette.text }]}>
            {monthName} {year}
          </Text>
        </Pressable>

        <Pressable
          onPress={schedule.goNextMonth}
          accessibilityRole="button"
          accessibilityLabel={nl.schedule.nextMonth}
          hitSlop={12}
          style={({ pressed }) => [styles.navBtn, { borderColor: palette.border }, pressed && styles.pressed]}
        >
          <Text style={[styles.navChevron, { color: palette.text }]}>›</Text>
        </Pressable>
      </View>

      {/* Weekdaglabels; za/zo in een eigen weekendband */}
      <View style={styles.weekdayRow}>
        {nl.schedule.weekdays.map((d, i) => {
          const weekend = i >= 5;
          return (
            <View
              key={d}
              style={[
                styles.weekdayCell,
                weekend && { backgroundColor: palette.weekendBand, borderRadius: radius.sm },
              ]}
            >
              <Text
                style={[
                  styles.weekdayLabel,
                  { color: weekend ? palette.text : palette.textSoft },
                ]}
              >
                {d}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Weken */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {/* Doordeweeks (ma–vr) */}
          <View style={styles.weekdayGroup}>
            {week.slice(0, 5).map((date, di) => (
              <DayCell
                key={di}
                date={date}
                assignment={date ? assignment(date) : null}
                snapshot={snapshot}
                isToday={date === today}
                onPress={onSelectDay}
              />
            ))}
          </View>

          {/* Weekendband (za–zo), visueel losgekoppeld */}
          <View style={[styles.weekendGroup, { backgroundColor: palette.weekendBand }]}>
            {week.slice(5, 7).map((date, di) => (
              <DayCell
                key={di}
                date={date}
                assignment={date ? assignment(date) : null}
                snapshot={snapshot}
                isToday={date === today}
                onPress={onSelectDay}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Legenda */}
      <View style={styles.legend}>
        {snapshot?.profiles.map((p) => (
          <View key={p.id} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: p.color }]} />
            <Text style={[styles.legendText, { color: palette.textSoft }]}>{p.displayName}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <Text style={[styles.legendStar, { color: palette.star }]}>★</Text>
          <Text style={[styles.legendText, { color: palette.textSoft }]}>
            {nl.schedule.extraMoment}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navChevron: { fontSize: 22, fontWeight: '600', lineHeight: 24 },
  pressed: { opacity: 0.6 },
  monthTitle: { ...typography.title, textTransform: 'capitalize' },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: 2,
  },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekdayLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  weekRow: { flexDirection: 'row', marginBottom: 4, gap: spacing.xs },
  weekdayGroup: { flex: 5, flexDirection: 'row' },
  weekendGroup: {
    flex: 2,
    flexDirection: 'row',
    borderRadius: radius.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendSwatch: { width: 16, height: 16, borderRadius: 5 },
  legendStar: { fontSize: 16 },
  legendText: { ...typography.caption },
});
