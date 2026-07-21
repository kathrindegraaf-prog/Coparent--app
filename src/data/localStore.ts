/**
 * Lokale implementatie van `Store` op AsyncStorage.
 *
 * Bewaart de overrides (en bij eerste start het demo-gezin). De afgeleide dagen
 * worden nooit opgeslagen — die rekent de engine live uit. In een latere stap
 * vervangen we deze module door een Supabase-implementatie met dezelfde interface.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayIso } from '@/lib/date';
import { buildSeed } from './seed';
import type { HouseholdSnapshot, Store } from './store';
import type { ScheduleOverride } from './types';

const KEY = 'samen:snapshot:v1';

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
    const rest = snap.overrides.filter((o) => o.date !== override.date);
    snap.overrides = [...rest, override];
    await save(snap);
  },

  async removeOverride(date: string) {
    const snap = await load();
    snap.overrides = snap.overrides.filter((o) => o.date !== date);
    await save(snap);
  },
};
