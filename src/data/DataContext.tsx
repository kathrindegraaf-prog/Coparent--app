/**
 * DataProvider — één gedeelde bron van waarheid voor de hele app. Laadt het
 * snapshot uit de lokale store, biedt CRUD voor afspraken, taken en overrides,
 * en persisteert elke wijziging. Alle schermen zien dezelfde live data.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { localStore } from './localStore';
import type { HouseholdSnapshot } from './store';
import type { Appointment, Child, Profile, ScheduleOverride, Task } from './types';

/** Eenvoudige, voldoende unieke id voor lokaal gebruik. */
export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface DataContextValue {
  snapshot: HouseholdSnapshot | null;
  loading: boolean;

  parents: Profile[];
  children: Child[];
  parentById: (id: string | null | undefined) => Profile | null;
  childById: (id: string | null | undefined) => Child | null;

  appointmentsOn: (date: string) => Appointment[];
  tasksOn: (date: string) => Task[];
  overrideOn: (date: string) => ScheduleOverride | null;

  saveOverride: (o: ScheduleOverride) => Promise<void>;
  deleteOverride: (date: string) => Promise<void>;
  saveAppointment: (a: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  saveTask: (t: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children: node }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<HouseholdSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStore.getSnapshot().then((s) => {
      setSnapshot(s);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const s = await localStore.getSnapshot();
    setSnapshot(s);
  }, []);

  const parents = snapshot?.profiles ?? [];
  const kids = snapshot?.children ?? [];

  const parentById = useCallback(
    (id: string | null | undefined) => parents.find((p) => p.id === id) ?? null,
    [parents]
  );
  const childById = useCallback(
    (id: string | null | undefined) => kids.find((c) => c.id === id) ?? null,
    [kids]
  );

  const appointmentsOn = useCallback(
    (date: string) =>
      (snapshot?.appointments ?? [])
        .filter((a) => a.date === date)
        .sort((a, b) => (a.startTime ?? '99').localeCompare(b.startTime ?? '99')),
    [snapshot]
  );
  const tasksOn = useCallback(
    (date: string) => (snapshot?.tasks ?? []).filter((t) => t.deadline === date),
    [snapshot]
  );
  const overrideOn = useCallback(
    (date: string) => (snapshot?.overrides ?? []).find((o) => o.date === date) ?? null,
    [snapshot]
  );

  const saveOverride = useCallback(async (o: ScheduleOverride) => { await localStore.upsertOverride(o); await refresh(); }, [refresh]);
  const deleteOverride = useCallback(async (date: string) => { await localStore.removeOverride(date); await refresh(); }, [refresh]);
  const saveAppointment = useCallback(async (a: Appointment) => { await localStore.upsertAppointment(a); await refresh(); }, [refresh]);
  const deleteAppointment = useCallback(async (id: string) => { await localStore.removeAppointment(id); await refresh(); }, [refresh]);
  const saveTask = useCallback(async (t: Task) => { await localStore.upsertTask(t); await refresh(); }, [refresh]);
  const deleteTask = useCallback(async (id: string) => { await localStore.removeTask(id); await refresh(); }, [refresh]);

  const toggleTask = useCallback(
    async (id: string) => {
      const t = snapshot?.tasks.find((x) => x.id === id);
      if (!t) return;
      await localStore.upsertTask({ ...t, status: t.status === 'open' ? 'done' : 'open' });
      await refresh();
    },
    [snapshot, refresh]
  );

  const resetDemo = useCallback(async () => {
    const s = await localStore.resetDemo();
    setSnapshot(s);
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      snapshot,
      loading,
      parents,
      children: kids,
      parentById,
      childById,
      appointmentsOn,
      tasksOn,
      overrideOn,
      saveOverride,
      deleteOverride,
      saveAppointment,
      deleteAppointment,
      saveTask,
      deleteTask,
      toggleTask,
      resetDemo,
    }),
    [
      snapshot, loading, parents, kids, parentById, childById, appointmentsOn, tasksOn,
      overrideOn, saveOverride, deleteOverride, saveAppointment, deleteAppointment,
      saveTask, deleteTask, toggleTask, resetDemo,
    ]
  );

  return <DataContext.Provider value={value}>{node}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData moet binnen een DataProvider gebruikt worden');
  return ctx;
}
