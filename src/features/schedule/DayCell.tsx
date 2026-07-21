/**
 * Eén dag in het maandraster. Kleur = ouder van die nacht. Overdrachtsdagen
 * (vrijdag) krijgen een tweekleurige split; een ster markeert een extra
 * contactmoment. Toegankelijk via een beschrijvend label.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { HouseholdSnapshot } from '@/data/store';
import { usePalette, radius, typography } from '@/design/theme';
import { parseIso } from '@/lib/date';
import { nl } from '@/i18n/nl';
import type { DayAssignment } from './engine';
import { parentInfo } from './useSchedule';

interface Props {
  date: string | null;
  assignment: DayAssignment | null;
  snapshot: HouseholdSnapshot | null;
  isToday: boolean;
  onPress: (date: string) => void;
}

function DayCellBase({ date, assignment, snapshot, isToday, onPress }: Props) {
  const palette = usePalette();

  if (!date || !assignment) {
    return <View style={styles.cell} accessibilityElementsHidden />;
  }

  const dayNum = parseIso(date).getUTCDate();
  const main = parentInfo(snapshot, assignment.parentId);
  const handoverDay = assignment.handover
    ? parentInfo(snapshot, assignment.handover.dayParentId)
    : null;

  const bg = main?.color ?? palette.surfaceAlt;
  const fg = main ? '#FFFFFF' : palette.textSoft;

  const whoLabel = main
    ? assignment.handover
      ? nl.day.dayThenEvening(handoverDay?.name ?? nl.schedule.unassigned, main.name)
      : nl.day.withParent(main.name)
    : nl.schedule.unassigned;

  return (
    <Pressable
      onPress={() => onPress(date)}
      accessibilityRole="button"
      accessibilityLabel={nl.a11y.dayCell(String(dayNum), whoLabel)}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      <View style={[styles.block, { backgroundColor: bg }]}>
        {/* Overdracht: linkerstrook in de kleur van de dag-ouder. */}
        {assignment.handover && handoverDay && (
          <View style={[styles.handoverStripe, { backgroundColor: handoverDay.color }]} />
        )}
        {assignment.handover && (
          <Text style={[styles.handoverMark, { color: fg }]} accessibilityElementsHidden>
            →
          </Text>
        )}

        <Text style={[styles.dayNum, { color: fg }]}>{dayNum}</Text>

        {assignment.isStar && (
          <Text
            style={[styles.star, { color: palette.star }]}
            accessibilityLabel={nl.a11y.starBadge}
          >
            ★
          </Text>
        )}

        {isToday && <View style={[styles.todayDot, { backgroundColor: fg }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  pressed: { opacity: 0.8 },
  block: {
    flex: 1,
    borderRadius: radius.md,
    padding: 6,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  handoverStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '38%',
  },
  handoverMark: {
    position: 'absolute',
    left: 4,
    bottom: 3,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },
  dayNum: {
    ...typography.label,
    fontSize: 14,
  },
  star: {
    position: 'absolute',
    right: 5,
    top: 4,
    fontSize: 13,
  },
  todayDot: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export const DayCell = memo(DayCellBase);
