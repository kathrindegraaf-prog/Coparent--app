/**
 * Maandraster. Rustig blokkenschema: kleur per ouder, weekend (za/zo) in een
 * eigen zachte band, vandaag met rand, subtiele stippen voor afspraken en
 * afwijkingen. Maand vooruit/terug via de kop.
 */

import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import type { ParentRole } from '@/data/types';
import { Card } from '@/design/components';
import { radius, spacing, typography, usePalette, type Palette } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { monthMatrix, parseIso } from '@/lib/date';
import { DayCell, type DayCellStyle } from './DayCell';
import type { UseSchedule } from './useSchedule';

function parentStyle(role: ParentRole | undefined, p: Palette) {
  if (role === 'parent_a') return { soft: p.parentA.soft, text: p.isDark ? '#E8B89F' : p.parentA.text };
  if (role === 'parent_b') return { soft: p.parentB.soft, text: p.isDark ? '#A9C2D8' : p.parentB.text };
  return { soft: p.surfaceAlt, text: p.textSoft };
}

export function MonthGrid({
  schedule,
  onSelectDay,
}: {
  schedule: UseSchedule;
  onSelectDay: (date: string) => void;
}) {
  const p = usePalette();
  const { parentById, appointmentsOn } = useData();
  const { year, month0, assignment, snapshot, today } = schedule;
  const weeks = monthMatrix(year, month0);
  const monthName = nl.schedule.months[month0];

  function cellProps(date: string | null): DayCellStyle | { empty: true } {
    if (!date) return { empty: true };
    const a = assignment(date);
    if (!a) return { empty: true };
    const parent = parentById(a.parentId);
    const st = parentStyle(parent?.role, p);
    const handoverParent = a.handover?.dayParentId ? parentById(a.handover.dayParentId) : null;
    const handoverBg =
      handoverParent && handoverParent.id !== a.parentId
        ? parentStyle(handoverParent.role, p).soft
        : undefined;
    const who = parent ? nl.day.withParent(parent.displayName) : nl.schedule.unassigned;
    const extras = [
      appointmentsOn(date).length ? nl.a11y.hasAppointment : '',
      a.deviation ? nl.a11y.hasDeviation : '',
      date === today ? nl.a11y.today : '',
    ].filter(Boolean).join(', ');

    return {
      dayNum: parseIso(date).getUTCDate(),
      softBg: st.soft,
      numColor: st.text,
      handoverBg,
      isToday: date === today,
      hasAppointment: appointmentsOn(date).length > 0,
      deviation: a.deviation,
      isStar: a.isStar,
      label: nl.a11y.dayCell(String(parseIso(date).getUTCDate()), extras ? `${who}, ${extras}` : who),
      onPress: () => onSelectDay(date),
    };
  }

  return (
    <View>
      {/* Maandnavigatie */}
      <View style={styles.header}>
        <Pressable
          onPress={schedule.goPrevMonth}
          accessibilityRole="button"
          accessibilityLabel={nl.schedule.prevMonth}
          hitSlop={12}
          style={({ pressed }) => [styles.navBtn, { borderColor: p.border }, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={20} color={p.text} />
        </Pressable>

        <Pressable onPress={schedule.goToday} accessibilityRole="button">
          <Text style={[styles.monthTitle, { color: p.text }]}>
            {monthName} {year}
          </Text>
        </Pressable>

        <Pressable
          onPress={schedule.goNextMonth}
          accessibilityRole="button"
          accessibilityLabel={nl.schedule.nextMonth}
          hitSlop={12}
          style={({ pressed }) => [styles.navBtn, { borderColor: p.border }, pressed && styles.pressed]}
        >
          <Feather name="chevron-right" size={20} color={p.text} />
        </Pressable>
      </View>

      <Card padded={false} style={{ padding: spacing.sm }}>
        {/* Weekdaglabels */}
        <View style={styles.weekdayRow}>
          {nl.schedule.weekdays.map((d, i) => (
            <View key={d} style={[styles.weekdayCell, i >= 5 && styles.weekendCol]}>
              <Text style={[typography.caption, { color: i >= 5 ? p.text : p.textSoft, fontWeight: '600' }]}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Weken */}
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            <View style={styles.weekdayGroup}>
              {week.slice(0, 5).map((date, di) => (
                <DayCell key={di} {...cellProps(date)} />
              ))}
            </View>
            <View style={[styles.weekendGroup, { backgroundColor: p.surfaceSunken }]}>
              {week.slice(5, 7).map((date, di) => (
                <DayCell key={di} {...cellProps(date)} />
              ))}
            </View>
          </View>
        ))}
      </Card>

      {/* Legenda */}
      <View style={styles.legend}>
        {snapshot?.profiles.map((profile) => {
          const st = parentStyle(profile.role, p);
          return (
            <View key={profile.id} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: st.soft, borderColor: profile.color }]} />
              <Text style={[typography.caption, { color: p.textSoft }]}>{profile.displayName}</Text>
            </View>
          );
        })}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: p.text }]} />
          <Text style={[typography.caption, { color: p.textSoft }]}>{nl.schedule.legendAppointment}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendRing, { borderColor: p.star }]} />
          <Text style={[typography.caption, { color: p.textSoft }]}>{nl.schedule.legendDeviation}</Text>
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
    width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  monthTitle: { ...typography.title, textTransform: 'capitalize' },
  weekdayRow: { flexDirection: 'row', paddingHorizontal: 3, paddingTop: spacing.xs, paddingBottom: 2 },
  weekdayCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  weekendCol: {},
  weekRow: { flexDirection: 'row' },
  weekdayGroup: { flex: 5, flexDirection: 'row' },
  weekendGroup: { flex: 2, flexDirection: 'row', borderRadius: radius.sm, marginVertical: 3, marginRight: 1 },
  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg,
    marginTop: spacing.lg, paddingHorizontal: spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendSwatch: { width: 16, height: 16, borderRadius: 5, borderWidth: 1.5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendRing: { backgroundColor: 'transparent', borderWidth: 1.5 },
  legendText: {},
});
