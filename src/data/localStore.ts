/**
 * Lokale implementatie van `Store` op AsyncStorage.
 *
 * Bewaart de volledige snapshot (gezin, afspraken, taken, overrides). De
 * afgeleide dagen worden nooit opgeslagen — die rekent de engine live uit. In
 * een latere stap vervangen we deze module door een Supabase-implementatie met
 * dezelfde interface.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayIso } from '@/lib/date';
import { buildSeed } from './seed';
import type { HouseholdSnapshot, Store } from './store';
import type { Appointment, ScheduleOverride, Task } from './types';

const KEY = 'samen:snapshot:v2';

async function load(): Promise<HouseholdSnapshot> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as HouseholdSnapshot;
    } catch {
      // Corrupte data: val terug op een verse seed.
    }
  }
  const seed = buildSeed(todayIso('Europe/Amsterdam'));
  await AsyncStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

async function save(snapshot: HouseholdSnapshot): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
}

export const localStore: Store = {
  async getSnapshot() {
    return load();
  },

  async upsertOverride(override: ScheduleOverride) {
    const snap = await load();
    snap.overrides = [...snap.overrides.filter((o) => o.date !== override.date), override];
    await save(snap);
  },

  async removeOverride(date: string) {
    const snap = await load();
    snap.overrides = snap.overrides.filter((o) => o.date !== date);
    await save(snap);
  },

  async upsertAppointment(appointment: Appointment) {
    const snap = await load();
    snap.appointments = [
      ...snap.appointments.filter((a) => a.id !== appointment.id),
      appointment,
    ];
    await save(snap);
  },

  async removeAppointment(id: string) {
    const snap = await load();
    snap.appointments = snap.appointments.filter((a) => a.id !== id);
    // Ontkoppel taken die naar deze afspraak verwezen.
    snap.tasks = snap.tasks.map((t) =>
      t.linkedAppointmentId === id ? { ...t, linkedAppointmentId: null } : t
    );
    await save(snap);
  },

  async upsertTask(task: Task) {
    const snap = await load();
    snap.tasks = [...snap.tasks.filter((t) => t.id !== task.id), task];
    await save(snap);
  },

  async removeTask(id: string) {
    const snap = await load();
    snap.tasks = snap.tasks.filter((t) => t.id !== id);
    await save(snap);
  },

  async resetDemo() {
    const seed = buildSeed(todayIso('Europe/Amsterdam'));
    await save(seed);
    return seed;
  },
};
