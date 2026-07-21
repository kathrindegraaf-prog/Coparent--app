/**
 * Pure datum-helpers zonder externe dependencies.
 *
 * We werken met kalenderdatums in `YYYY-MM-DD` en gebruiken intern UTC-Date's,
 * puur om de rekenkunde tijdzone-onafhankelijk en voorspelbaar te houden. Er komt
 * geen tijd/uur aan te pas — een dag is een dag.
 */

import type { IsoDate, IsoWeekday } from '@/data/types';

/** Parse `YYYY-MM-DD` naar een UTC-Date op middernacht. */
export function parseIso(date: IsoDate): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Formatteer een UTC-Date terug naar `YYYY-MM-DD`. */
export function formatIso(date: Date): IsoDate {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ISO-weekdag: 1 = maandag ... 7 = zondag. */
export function isoWeekday(date: IsoDate | Date): IsoWeekday {
  const d = typeof date === 'string' ? parseIso(date) : date;
  const js = d.getUTCDay(); // 0 = zondag ... 6 = zaterdag
  return (js === 0 ? 7 : js) as IsoWeekday;
}

/** Voeg (eventueel negatief) aantal dagen toe. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const d = parseIso(date);
  d.setUTCDate(d.getUTCDate() + days);
  return formatIso(d);
}

/** Aantal hele dagen tussen twee datums (b - a). */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  const ms = parseIso(b).getTime() - parseIso(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** De zaterdag van het weekend waar `date` bij hoort (za = zichzelf, zo = -1). */
export function saturdayOfWeekend(date: IsoDate): IsoDate {
  const wd = isoWeekday(date);
  if (wd === 6) return date;
  if (wd === 7) return addDays(date, -1);
  // Vrijdag hoort visueel bij het aankomende weekend.
  if (wd === 5) return addDays(date, 1);
  // Andere dagen: dichtstbijzijnde komende zaterdag.
  return addDays(date, 6 - wd);
}

/** Eerste dag van de maand van `date`. */
export function startOfMonth(year: number, month0: number): IsoDate {
  return formatIso(new Date(Date.UTC(year, month0, 1)));
}

/** Aantal dagen in de maand (month0 = 0..11). */
export function daysInMonth(year: number, month0: number): number {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

/**
 * Bouw een maandraster (maandag-eerst) als weken van 7 cellen.
 * Cellen buiten de maand zijn `null`.
 */
export function monthMatrix(year: number, month0: number): (IsoDate | null)[][] {
  const total = daysInMonth(year, month0);
  const first = startOfMonth(year, month0);
  const lead = isoWeekday(first) - 1; // aantal lege cellen voor dag 1
  const cells: (IsoDate | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    cells.push(formatIso(new Date(Date.UTC(year, month0, d))));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (IsoDate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Vandaag als `YYYY-MM-DD` in de gegeven tijdzone (default lokaal). */
export function todayIso(timeZone?: string): IsoDate {
  const now = new Date();
  if (!timeZone) {
    return formatIso(
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    );
  }
  // en-CA geeft YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
}
