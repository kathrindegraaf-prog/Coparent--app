/**
 * Eén dag in het maandraster. Rustig en kleur-gecodeerd: zachte oudertint als
 * achtergrond, dagnummer in de oudertint. Vandaag krijgt een rand; afspraken en
 * afwijkingen krijgen elk een eigen subtiele stip. Geen drukke tekst in het vakje.
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, typography, usePalette } from '@/design/theme';

export interface DayCellStyle {
  dayNum: number;
  softBg: string;
  numColor: string;
  /** Zachte tint van de overdracht-ouder (linkerstrook), indien afwijkend. */
  handoverBg?: string;
  isToday: boolean;
  hasAppointment: boolean;
  deviation: boolean;
  isStar: boolean;
  label: string;
  onPress: () => void;
}

function DayCellBase(props: DayCellStyle | { empty: true }) {
  const p = usePalette();
  if ('empty' in props) {
    return <View style={styles.cell} accessibilityElementsHidden pointerEvents="none" />;
  }
  const { dayNum, softBg, numColor, handoverBg, isToday, hasAppointment, deviation, isStar, label, onPress } = props;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.cell}
    >
      <View
        style={[
          styles.block,
          { backgroundColor: softBg },
          isToday && { borderColor: p.text, borderWidth: 2 },
        ]}
      >
        {handoverBg ? <View style={[styles.handover, { backgroundColor: handoverBg }]} /> : null}

        <Text style={[styles.num, { color: numColor }, isToday && { fontWeight: '800' }]}>
          {dayNum}
        </Text>

        <View style={styles.indicators}>
          {hasAppointment ? <View style={[styles.dot, { backgroundColor: numColor }]} /> : null}
          {deviation ? <View style={[styles.dot, styles.ring, { borderColor: p.star }]} /> : null}
          {isStar ? <Text style={[styles.star, { color: p.star }]}>★</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 0.92, padding: 3 },
  block: {
    flex: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingTop: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 0,
  },
  handover: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '34%', opacity: 0.9 },
  num: { ...typography.label, fontSize: 15 },
  indicators: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6, minHeight: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  ring: { backgroundColor: 'transparent', borderWidth: 1.5 },
  star: { fontSize: 11, lineHeight: 12, marginTop: -1 },
});

export const DayCell = memo(DayCellBase);
