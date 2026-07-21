/**
 * Hook die het gezin-snapshot laadt en per datum de toewijzing beschikbaar maakt.
 * Houdt ook de zichtbare maand bij (vooruit/terug klikken).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { localStore } from '@/data/localStore';
import type { HouseholdSnapshot } from '@/data/store';
import { todayIso } from '@/lib/date';
import { assignmentFor, type DayAssignment } from './engine';

export interface UseSchedule {
  loading: boolean;
  snapshot: HouseholdSnapshot | null;
  year: number;
  month0: number;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  goToday: () => void;
  /** Toewijzing voor één datum (of null zolang er geen data is). */
  assignment: (date: string) => DayAssignment | null;
  reload: () => Promise<void>;
}

export function useSchedule(): UseSchedule {
  const [snapshot, setSnapshot] = useState<HouseholdSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const today = todayIso('Europe/Amsterdam');
  const [{ year, month0 }, setMonth] = useState(() => {
    const d = new Date(today + 'T00:00:00Z');
    return { year: d.getUTCFullYear(), month0: d.getUTCMonth() };
  });

  const reload = useCallback(async () => {
    const snap = await localStore.getSnapshot();
    setSnapshot(snap);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

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

  return useMemo(
    () => ({
      loading,
      snapshot,
      year,
      month0,
      goPrevMonth,
      goNextMonth,
      goToday,
      assignment,
      reload,
    }),
    [loading, snapshot, year, month0, goPrevMonth, goNextMonth, goToday, assignment, reload]
  );
}

/** Kleine helper: geef de kleur/naam van een ouder op basis van id. */
export function parentInfo(snapshot: HouseholdSnapshot | null, id: string | null) {
  if (!snapshot || !id) return null;
  const p = snapshot.profiles.find((x) => x.id === id);
  return p ? { name: p.displayName, color: p.color, role: p.role } : null;
}
