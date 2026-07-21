/**
 * Schema-engine — de kern van functie 1.
 *
 * Pure functies (geen React, geen I/O) die uit een `ScheduleRule` + de
 * `ScheduleOverride`s afleiden welke ouder op welke dag aan de beurt is. Zo slaan
 * we geen los record per dag op en blijft het schema oneindig doorlopen.
 *
 * Weekendmodel (keuze gebruiker): het weekendblok loopt vrijdagavond t/m zondag.
 * Vrijdag is dus een overdrachtsdag — overdag nog de doordeweekse ouder, vanaf de
 * avond de weekendouder. Weekends wisselen om-en-om t.o.v. een ankerweekend.
 */

import type {
  IsoDate,
  Profile,
  ScheduleOverride,
  ScheduleRule,
} from '@/data/types';
import { daysBetween, isoWeekday, saturdayOfWeekend } from '@/lib/date';

/** Overdracht binnen één dag (bv. vrijdag: overdag ouder X, 's avonds ouder Y). */
export interface Handover {
  /** Ouder overdag (kan null zijn als de regel die dag niet toewijst). */
  dayParentId: string | null;
  /** Ouder vanaf de avond/nacht. */
  eveningParentId: string;
}

/** De afgeleide toewijzing voor één kalenderdag. */
export interface DayAssignment {
  date: IsoDate;
  /** Wie heeft de kinderen die nacht (de "hoofd"-ouder van de dag). Null = onbepaald. */
  parentId: string | null;
  /** Hoort deze dag bij een weekendblok? */
  isWeekend: boolean;
  /** Aanwezig op overdrachtsdagen (vrijdag). */
  handover?: Handover;
  /** Extra contactmoment (ster), afkomstig uit een override. */
  isStar: boolean;
  /** Is deze dag door een override bepaald i.p.v. de regel? */
  overridden: boolean;
}

/** Interne helper: de "andere" ouder t.o.v. een gegeven ouder. */
function otherParent(parents: Profile[], parentId: string): string | null {
  const other = parents.find((p) => p.id !== parentId);
  return other ? other.id : null;
}

/**
 * Welke ouder heeft het weekend waar `saturday` in valt?
 * Weekends alterneren t.o.v. het ankerweekend: even aantal weekenden verschil =
 * ankerouder, oneven = de andere ouder.
 */
function weekendOwner(
  rule: ScheduleRule,
  parents: Profile[],
  saturday: IsoDate
): string | null {
  const anchorSaturday = saturdayOfWeekend(rule.weekendAnchorDate);
  const weeks = Math.round(daysBetween(anchorSaturday, saturday) / 7);
  const even = ((weeks % 2) + 2) % 2 === 0;
  return even
    ? rule.weekendAnchorParent
    : otherParent(parents, rule.weekendAnchorParent);
}

/** Berekent de toewijzing voor één dag uit regel + overrides. */
export function assignmentFor(
  date: IsoDate,
  rule: ScheduleRule,
  overrides: ScheduleOverride[],
  parents: Profile[]
): DayAssignment {
  const wd = isoWeekday(date);
  const inWeekend = rule.weekendEnabled && rule.weekendDays.includes(wd);
  const isFridayHandover =
    rule.weekendEnabled && rule.fridayHandover && wd === 5;

  // 1. Basis-toewijzing uit de regel.
  let parentId: string | null;
  let handover: Handover | undefined;

  if (isFridayHandover) {
    // Vrijdag: overdag de doordeweekse ouder (indien toegewezen), 's avonds de
    // weekendouder. De nacht telt als weekendouder → dat is de hoofd-ouder.
    const saturday = saturdayOfWeekend(date);
    const eveningParentId = weekendOwner(rule, parents, saturday);
    const dayParentId = rule.weekdayAssignment[wd] ?? null;
    parentId = eveningParentId;
    if (eveningParentId) {
      handover = { dayParentId, eveningParentId };
    }
  } else if (inWeekend) {
    const saturday = saturdayOfWeekend(date);
    parentId = weekendOwner(rule, parents, saturday);
  } else {
    parentId = rule.weekdayAssignment[wd] ?? null;
  }

  // 2. Override wint van de regel.
  const override = overrides.find((o) => o.date === date);
  let isStar = false;
  let overridden = false;
  if (override) {
    isStar = override.isStar;
    if (override.assignedTo) {
      parentId = override.assignedTo;
      overridden = true;
      handover = undefined; // een expliciete toewijzing heft de overdracht op
    } else {
      overridden = true;
    }
  }

  return {
    date,
    parentId,
    isWeekend: inWeekend,
    handover,
    isStar,
    overridden,
  };
}

/** Berekent de toewijzingen voor een reeks datums. */
export function assignmentsForDates(
  dates: IsoDate[],
  rule: ScheduleRule,
  overrides: ScheduleOverride[],
  parents: Profile[]
): DayAssignment[] {
  return dates.map((d) => assignmentFor(d, rule, overrides, parents));
}
