/**
 * Horizontale strook met de komende dagen: per dag een blokje in de kleur van de
 * ouder die dan de kinderen heeft, met vandaag gemarkeerd en een stipje bij
 * afspraken. Geeft in één oogopslag rust en overzicht.
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import type { ParentRole } from '@/data/types';
import { PressableScale } from '@/design/components';
import { radius, spacing, typography, usePalette, type Palette } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { addDays, isoWeekday, parseIso } from '@/lib/date';
import type { UseSchedule } from './useSchedule';

function tint(role: ParentRole | undefined, p: Palette) {
  if (role === 'parent_a') return { soft: p.parentA.soft, text: p.isDark ? '#E8B89F' : p.parentA.text };
  if (role === 'parent_b') return { soft: p.parentB.soft, text: p.isDark ? '#A9C2D8' : p.parentB.text };
  return { soft: p.surfaceAlt, text: p.textSoft };
}

export function UpcomingStrip({
  schedule,
  days = 7,
  onSelect,
}: {
  schedule: UseSchedule;
  days?: number;
  onSelect: (date: string) => void;
}) {
  const p = usePalette();
  const { parentById, appointmentsOn } = useData();
  const today = schedule.today;

  const items = Array.from({ length: days }, (_, i) => addDays(today, i));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((date, i) => {
        const a = schedule.assignment(date);
        const parent = parentById(a?.parentId ?? null);
        const st = tint(parent?.role, p);
        const isToday = date === today;
        const hasAppt = appointmentsOn(date).length > 0;
        const wd = nl.schedule.weekdays[isoWeekday(date) - 1];
        const dayNum = parseIso(date).getUTCDate();

        return (
          <PressableScale
            key={date}
            onPress={() => onSelect(date)}
            accessibilityRole="button"
            accessibilityLabel={`${wd} ${dayNum}, ${parent ? nl.day.withParent(parent.displayName) : nl.schedule.unassigned}${isToday ? ', ' + nl.a11y.today : ''}`}
            style={[
              styles.chip,
              { backgroundColor: st.soft, borderColor: isToday ? p.text : 'transparent', borderWidth: isToday ? 1.5 : 0 },
            ]}
          >
            <Text style={[typography.caption, { color: st.text, textTransform: 'uppercase', fontWeight: '700' }]}>
              {wd}
            </Text>
            <Text style={[typography.heading, { color: st.text }]}>{dayNum}</Text>
            <View style={[styles.dot, { backgroundColor: hasAppt ? st.text : 'transparent' }]} />
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  chip: {
    width: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 3,
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
});
