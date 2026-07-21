/**
 * Weekweergave — de zeven dagen onder elkaar, elk met de ouder-kleur, wie de
 * kinderen heeft en de afspraken van die dag. Rustiger en beter leesbaar voor
 * dagelijks gebruik dan het maandraster.
 */

import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import type { ParentRole } from '@/data/types';
import { Card, PressableScale } from '@/design/components';
import { radius, spacing, typography, usePalette, type Palette } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { addDays, isoWeekday, parseIso } from '@/lib/date';
import { formatTime } from '@/lib/format';
import type { UseSchedule } from './useSchedule';

function tint(role: ParentRole | undefined, p: Palette) {
  if (role === 'parent_a') return { base: p.parentA.base, soft: p.parentA.soft, text: p.isDark ? '#E8B89F' : p.parentA.text };
  if (role === 'parent_b') return { base: p.parentB.base, soft: p.parentB.soft, text: p.isDark ? '#A9C2D8' : p.parentB.text };
  return { base: p.borderStrong, soft: p.surfaceAlt, text: p.textSoft };
}

export function WeekView({
  schedule,
  onSelectDay,
}: {
  schedule: UseSchedule;
  onSelectDay: (date: string) => void;
}) {
  const p = usePalette();
  const { parentById, appointmentsOn } = useData();
  const [offset, setOffset] = useState(0);

  const today = schedule.today;
  const monday = addDays(today, -(isoWeekday(today) - 1) + offset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const rangeLabel = `${parseIso(monday).getUTCDate()} ${nl.schedule.monthsShort[parseIso(monday).getUTCMonth()]} – ${parseIso(days[6]).getUTCDate()} ${nl.schedule.monthsShort[parseIso(days[6]).getUTCMonth()]}`;

  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={() => setOffset((o) => o - 1)} accessibilityRole="button" accessibilityLabel={nl.schedule.prevWeek} hitSlop={12} style={[styles.nav, { borderColor: p.border }]}>
          <Feather name="chevron-left" size={20} color={p.text} />
        </Pressable>
        <Pressable onPress={() => setOffset(0)} accessibilityRole="button">
          <Text style={[typography.heading, { color: p.text }]}>{offset === 0 ? nl.schedule.thisWeek : rangeLabel}</Text>
        </Pressable>
        <Pressable onPress={() => setOffset((o) => o + 1)} accessibilityRole="button" accessibilityLabel={nl.schedule.nextWeek} hitSlop={12} style={[styles.nav, { borderColor: p.border }]}>
          <Feather name="chevron-right" size={20} color={p.text} />
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        {days.map((date) => {
          const a = schedule.assignment(date);
          const parent = parentById(a?.parentId ?? null);
          const st = tint(parent?.role, p);
          const isToday = date === today;
          const appts = appointmentsOn(date);
          const wd = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'][isoWeekday(date) - 1];

          return (
            <PressableScale key={date} onPress={() => onSelectDay(date)} accessibilityRole="button">
              <Card padded={false} style={{ ...(isToday ? { borderColor: p.text } : null) }}>
                <View style={styles.dayRow}>
                  <View style={[styles.bar, { backgroundColor: st.base }]} />
                  <View style={styles.dayHead}>
                    <Text style={[typography.caption, { color: p.textSoft, textTransform: 'capitalize' }]}>{wd}</Text>
                    <Text style={[typography.heading, { color: p.text }]}>{parseIso(date).getUTCDate()}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.whoRow}>
                      <View style={[styles.whoPill, { backgroundColor: st.soft }]}>
                        <Text style={[typography.caption, { color: st.text, fontWeight: '700' }]}>
                          {parent ? parent.displayName : nl.schedule.unassigned}
                        </Text>
                      </View>
                      {a?.deviation ? <Feather name="alert-circle" size={13} color={p.star} /> : null}
                      {isToday ? <Text style={[typography.caption, { color: p.textFaint }]}>· {nl.common.today.toLowerCase()}</Text> : null}
                    </View>
                    {appts.slice(0, 2).map((ap) => (
                      <Text key={ap.id} style={[typography.caption, { color: p.textSoft }]} numberOfLines={1}>
                        {formatTime(ap.startTime)}  {ap.title}
                      </Text>
                    ))}
                    {appts.length > 2 ? (
                      <Text style={[typography.caption, { color: p.textFaint }]}>+{appts.length - 2} meer</Text>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={18} color={p.textFaint} />
                </View>
              </Card>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  nav: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, paddingRight: spacing.lg },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: radius.pill, minHeight: 44 },
  dayHead: { width: 68 },
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  whoPill: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.pill },
});
