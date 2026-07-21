/**
 * Demo-gezin — Kathrin & Pieter met Max & Lotte. Realistische Nederlandse data
 * zodat de app direct te testen is zonder backend. Datums worden relatief aan de
 * referentiedatum berekend, zodat de demo altijd "vandaag/morgen" laat zien.
 */

import { parentPalette } from '@/design/theme';
import { addDays, isoWeekday, saturdayOfWeekend } from '@/lib/date';
import type { HouseholdSnapshot } from './store';
import type { IsoDate, IsoWeekday } from './types';

const HH = 'household-demo';
const KATHRIN = 'p-kathrin';
const PIETER = 'p-pieter';
const MAX = 'c-max';
const LOTTE = 'c-lotte';

/** De eerstvolgende datum (>= from) met de gegeven weekdag. */
function nextWeekday(from: IsoDate, wd: IsoWeekday): IsoDate {
  let cursor = from;
  for (let i = 0; i < 7; i++) {
    if (isoWeekday(cursor) === wd) return cursor;
    cursor = addDays(cursor, 1);
  }
  return from;
}

export function buildSeed(referenceDate: IsoDate): HouseholdSnapshot {
  const today = referenceDate;
  const tomorrow = addDays(today, 1);
  const voetbalDate = nextWeekday(today, 2); // dinsdag
  const tandartsDate = nextWeekday(today, 3); // woensdag
  const zondag = nextWeekday(today, 7); // komende zondag (Pieters weekend)
  const anchor = saturdayOfWeekend(today);

  const VOETBAL = 'a-voetbal';
  const TANDARTS = 'a-tandarts';
  const T_SHIRT = 't-shirt';

  return {
    household: {
      id: HH,
      name: 'Kathrin & Pieter',
      timezone: 'Europe/Amsterdam',
      plan: 'free',
      createdAt: '2026-01-01T00:00:00Z',
    },
    profiles: [
      {
        id: KATHRIN, householdId: HH, displayName: 'Kathrin', role: 'parent_a',
        color: parentPalette.a.base, isOwner: true, createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: PIETER, householdId: HH, displayName: 'Pieter', role: 'parent_b',
        color: parentPalette.b.base, isOwner: false, createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    children: [
      { id: MAX, householdId: HH, name: 'Max', createdAt: '2026-01-01T00:00:00Z' },
      { id: LOTTE, householdId: HH, name: 'Lotte', createdAt: '2026-01-01T00:00:00Z' },
    ],
    rule: {
      id: 'rule-demo',
      householdId: HH,
      activeFrom: '2026-01-01',
      // ma+di bij Pieter, wo+do bij Kathrin.
      weekdayAssignment: { 1: PIETER, 2: PIETER, 3: KATHRIN, 4: KATHRIN },
      weekendEnabled: true,
      weekendDays: [5, 6, 7],
      fridayHandover: true,
      weekendAnchorDate: anchor,
      weekendAnchorParent: PIETER, // dit weekend is van Pieter
    },
    overrides: [
      {
        id: 'o-zondag-eten',
        householdId: HH,
        date: zondag,
        assignedTo: null,
        extraMealParentId: KATHRIN,
        isStar: false,
        reason: 'Kathrin kookt zondag, de kinderen eten bij haar',
        createdBy: KATHRIN,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    appointments: [
      {
        id: VOETBAL,
        householdId: HH,
        title: 'Voetbaltraining Max',
        date: voetbalDate,
        startTime: '18:30',
        endTime: '19:45',
        childIds: [MAX],
        location: 'Sportpark Zuid',
        responsibleParentId: PIETER,
        broughtById: PIETER,
        pickedUpById: PIETER,
        note: 'Voetbalshirt niet vergeten.',
        linkedTaskId: T_SHIRT,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: TANDARTS,
        householdId: HH,
        title: 'Tandarts Lotte',
        date: tandartsDate,
        startTime: '10:30',
        childIds: [LOTTE],
        location: 'Tandartspraktijk Kastanjelaan',
        responsibleParentId: KATHRIN,
        broughtById: PIETER,
        pickedUpById: KATHRIN,
        note: 'Pieter gaat mee, Kathrin haalt Lotte daarna op.',
        linkedTaskId: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    tasks: [
      {
        id: T_SHIRT,
        householdId: HH,
        title: 'Voetbalshirt van Max meenemen',
        childId: MAX,
        responsibleParentId: PIETER,
        deadline: voetbalDate,
        status: 'open',
        linkedAppointmentId: VOETBAL,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't-verzekering',
        householdId: HH,
        title: 'Verzekeringspas klaarleggen',
        childId: null,
        responsibleParentId: KATHRIN,
        deadline: tomorrow,
        status: 'open',
        linkedAppointmentId: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't-schoolformulier',
        householdId: HH,
        title: 'Schoolformulier invullen',
        childId: LOTTE,
        responsibleParentId: KATHRIN,
        deadline: addDays(today, 3),
        status: 'open',
        linkedAppointmentId: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't-cadeau',
        householdId: HH,
        title: 'Cadeau voor feestje kopen',
        childId: MAX,
        responsibleParentId: PIETER,
        deadline: addDays(today, 6),
        status: 'open',
        linkedAppointmentId: null,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
  };
}
