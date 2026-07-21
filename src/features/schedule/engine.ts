/**
 * Schema-engine — de kern. Pure functies (geen React, geen I/O) die uit een
 * `ScheduleRule` + de `ScheduleOverride`s afleiden welke ouder op welke dag aan
 * de beurt is. Zo slaan we geen los record per dag op en loopt het schema door.
 *
 * Weekendmodel: het weekendblok loopt vrijdagavond t/m zondag. Vrijdag is een
 * overdrachtsdag. Weekends wisselen om-en-om t.o.v. een ankerweekend.
 *
 * Een override wint altijd van de regel, maar verandert de regel nooit.
 */

import type {
  ChildAssignment,
  IsoDate,
  Profile,
  ScheduleOverride,
  ScheduleRule,
} from '@/data/types';
import { daysBetween, isoWeekday, saturdayOfWeekend } from '@/lib/date';

/** Overdracht binnen één dag (bv. vrijdag: overdag ouder X, 's avonds ouder Y). */
export interface Handover {
  dayParentId: string | null;
  eveningParentId: string;
}

/** De afgeleide toewijzing voor één kalenderdag. */
export interface DayAssignment {
  date: IsoDate;
  /** Wie heeft de kinderen die nacht (de "hoofd"-ouder). Null = onbepaald. */
  parentId: string | null;
  /** Hoort deze dag bij een weekendblok? */
  isWeekend: boolean;
  /** Aanwezig op overdrachtsdagen (vrijdag). */
  handover?: Handover;
  /** Extra contactmoment (ster), uit een override. */
  isStar: boolean;
  /** Is deze dag door een override bepaald i.p.v. de regel? */
  overridden: boolean;
  /** Per-kind afwijkende indeling (alleen als kinderen verschillend zijn ingedeeld). */
  childAssignments?: ChildAssignment[];
  /** Extra eetmoment bij deze ouder. */
  extraMealParentId?: string | null;
  /** Haal-/brengafspraak (vrije tekst uit override). */
  logistics?: string;
  /** Korte reden voor de aanpassing. */
  reason?: string;
  /** Wijkt deze dag zichtbaar af van het basisschema? */
  deviation: boolean;
}

function otherParent(parents: Profile[], parentId: string): string | null {
  const other = parents.find((p) => p.id !== parentId);
  return other ? other.id : null;
}

/**
 * Welke ouder heeft het weekend waar `saturday` in valt? Weekends alterneren
 * t.o.v. het ankerweekend: even verschil = ankerouder, oneven = de ander.
 */
function weekendOwner(rule: ScheduleRule, parents: Profile[], saturday: IsoDate): string | null {
  const anchorSaturday = saturdayOfWeekend(rule.weekendAnchorDate);
  const weeks = Math.round(daysBetween(anchorSaturday, saturday) / 7);
  const even = ((weeks % 2) + 2) % 2 === 0;
  return even ? rule.weekendAnchorParent : otherParent(parents, rule.weekendAnchorParent);
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
  const isFridayHandover = rule.weekendEnabled && rule.fridayHandover && wd === 5;

  // 1. Basis-toewijzing uit de regel.
  let parentId: string | null;
  let handover: Handover | undefined;

  if (isFridayHandover) {
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
  let childAssignments: ChildAssignment[] | undefined;
  let extraMealParentId: string | null | undefined;
  let logistics: string | undefined;
  let reason: string | undefined;

  if (override) {
    isStar = override.isStar;
    extraMealParentId = override.extraMealParentId ?? undefined;
    logistics = override.logistics || undefined;
    reason = override.reason || undefined;

    if (override.assignedTo) {
      parentId = override.assignedTo;
      overridden = true;
      handover = undefined; // een expliciete toewijzing heft de overdracht op
    }
    if (override.childAssignments && override.childAssignments.length > 0) {
      childAssignments = override.childAssignments;
      overridden = true;
    }
    if (isStar || extraMealParentId || logistics) {
      overridden = true;
    }
  }

  const deviation = !!(
    override &&
    (override.assignedTo ||
      (override.childAssignments && override.childAssignments.length > 0) ||
      override.extraMealParentId ||
      override.logistics ||
      override.isStar)
  );

  return {
    date,
    parentId,
    isWeekend: inWeekend,
    handover,
    isStar,
    overridden,
    childAssignments,
    extraMealParentId,
    logistics,
    reason,
    deviation,
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

/**
 * Vind de eerstvolgende dag (vanaf `from`, exclusief) waarop de hoofd-ouder
 * wisselt t.o.v. de dag ervoor. Handig voor "volgende wissel" op het dashboard.
 */
export function nextSwitch(
  from: IsoDate,
  rule: ScheduleRule,
  overrides: ScheduleOverride[],
  parents: Profile[],
  horizonDays = 60
): { date: IsoDate; parentId: string | null } | null {
  let prev = assignmentFor(from, rule, overrides, parents).parentId;
  let cursor = from;
  for (let i = 0; i < horizonDays; i++) {
    const d = new Date(cursor + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    cursor = d.toISOString().slice(0, 10);
    const a = assignmentFor(cursor, rule, overrides, parents);
    if (a.parentId && a.parentId !== prev) {
      return { date: cursor, parentId: a.parentId };
    }
    prev = a.parentId;
  }
  return null;
}
