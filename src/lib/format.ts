/**
 * Kleine formatteer-helpers voor labels in de UI (Nederlands).
 */

import type { Child } from '@/data/types';
import { nl } from '@/i18n/nl';
import { daysBetween, isoWeekday, parseIso } from './date';

/** "di 22 jul" */
export function formatDayShort(date: string): string {
  const d = parseIso(date);
  return `${nl.schedule.weekdays[isoWeekday(date) - 1]} ${d.getUTCDate()} ${nl.schedule.monthsShort[d.getUTCMonth()]}`;
}

/** "dinsdag 22 juli" */
export function formatDayLong(date: string): string {
  const d = parseIso(date);
  const wd = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'][isoWeekday(date) - 1];
  return `${wd} ${d.getUTCDate()} ${nl.schedule.months[d.getUTCMonth()]}`;
}

/** Tijdslabel voor een afspraak (begintijd; '—' als er geen tijd is). */
export function formatTime(startTime?: string): string {
  return startTime || '—';
}

/** Relatief label t.o.v. vandaag: vandaag / morgen / di 22 jul. */
export function relativeDay(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return nl.common.today;
  if (diff === 1) return nl.common.tomorrow;
  return formatDayShort(date);
}

/** Namen van kinderen: "Max", "Max & Lotte" of "Iedereen" bij leeg/alle. */
export function childrenLabel(childIds: string[], all: Child[]): string {
  if (childIds.length === 0 || childIds.length === all.length) return 'Iedereen';
  const names = childIds
    .map((id) => all.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[];
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}
