/**
 * Hook rond de gedeelde data-context: maandnavigatie + per-datum toewijzing via
 * de engine. De data zelf komt uit `DataProvider`, zodat wijzigingen overal
 * meteen doorwerken.
 */

import { useCallback, useMemo, useState } from 'react';
import { useData } from '@/data/DataContext';
import type { HouseholdSnapshot } from '@/data/store';
import { todayIso } from '@/lib/date';
import { assignmentFor, nextSwitch, type DayAssignment } from './engine';

export function useSchedule() {
  const { snapshot, loading } = useData();
  const today = todayIso('Europe/Amsterdam');

  const [{ year, month0 }, setMonth] = useState(() => {
    const d = new Date(today + 'T00:00:00Z');
    return { year: d.getUTCFullYear(), month0: d.getUTCMonth() };
  });

  const goPrevMonth = useCallback(() => {
    setMonth((m) => {
      const d = new Date(Date.UTC(m.year, m.month0 - 1, 1));
      return { year: d.getUTCFullYear(), month0: d.getUTCMonth() };
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setMonth((m) => {
      const d = new Date(Date.UTC(m.year, m.month0 + 1, 1));
      return { year: d.getUTCFullYear(), month0: d.getUTCMonth() };
    });
  }, []);

  const goToday = useCallback(() => {
    const d = new Date(today + 'T00:00:00Z');
    setMonth({ year: d.getUTCFullYear(), month0: d.getUTCMonth() });
  }, [today]);

  const assignment = useCallback(
    (date: string): DayAssignment | null => {
      if (!snapshot) return null;
      return assignmentFor(date, snapshot.rule, snapshot.overrides, snapshot.profiles);
    },
    [snapshot]
  );

  const upcomingSwitch = useMemo(() => {
    if (!snapshot) return null;
    return nextSwitch(today, snapshot.rule, snapshot.overrides, snapshot.profiles);
  }, [snapshot, today]);

  return {
    loading,
    snapshot,
    today,
    year,
    month0,
    goPrevMonth,
    goNextMonth,
    goToday,
    assignment,
    upcomingSwitch,
  };
}

export type UseSchedule = ReturnType<typeof useSchedule>;

/** Kleur/naam van een ouder op basis van id. */
export function parentInfo(snapshot: HouseholdSnapshot | null, id: string | null) {
  if (!snapshot || !id) return null;
  const p = snapshot.profiles.find((x) => x.id === id);
  return p ? { name: p.displayName, color: p.color, role: p.role } : null;
}
