/**
 * Demo-gezin zodat de app direct draaibaar is zonder backend.
 * Ma+di bij Sanne, wo+do bij Daan, weekenden om-en-om (vr-avond t/m zo).
 */

import { parentPalette } from '@/design/theme';
import { saturdayOfWeekend } from '@/lib/date';
import type { HouseholdSnapshot } from './store';

const SANNE = 'profile-sanne';
const DAAN = 'profile-daan';

export function buildSeed(referenceDate: string): HouseholdSnapshot {
  // Anker het weekend op een zaterdag rond de referentiedatum, ouder A begint.
  const anchor = saturdayOfWeekend(referenceDate);

  return {
    household: {
      id: 'household-demo',
      name: 'Ons gezin',
      timezone: 'Europe/Amsterdam',
      plan: 'free',
      createdAt: '2026-01-01T00:00:00Z',
    },
    profiles: [
      {
        id: SANNE,
        householdId: 'household-demo',
        displayName: 'Sanne',
        role: 'parent_a',
        color: parentPalette.a.base,
        isOwner: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: DAAN,
        householdId: 'household-demo',
        displayName: 'Daan',
        role: 'parent_b',
        color: parentPalette.b.base,
        isOwner: false,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    children: [
      { id: 'child-1', householdId: 'household-demo', name: 'Noor', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'child-2', householdId: 'household-demo', name: 'Tim', createdAt: '2026-01-01T00:00:00Z' },
    ],
    rule: {
      id: 'rule-demo',
      householdId: 'household-demo',
      activeFrom: '2026-01-01',
      weekdayAssignment: { 1: SANNE, 2: SANNE, 3: DAAN, 4: DAAN },
      weekendEnabled: true,
      weekendDays: [5, 6, 7],
      fridayHandover: true,
      weekendAnchorDate: anchor,
      weekendAnchorParent: SANNE,
    },
    overrides: [],
  };
}
