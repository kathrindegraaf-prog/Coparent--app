/**
 * Repository-interface voor de datalaag.
 *
 * De UI praat alléén met deze interface. Nu zit erachter een lokale
 * AsyncStorage-implementatie; later kan er een Supabase-implementatie (EU) achter
 * zonder dat de UI verandert.
 */

import type {
  Appointment,
  Child,
  Household,
  Profile,
  ScheduleOverride,
  ScheduleRule,
  Task,
} from './types';

export interface HouseholdSnapshot {
  household: Household;
  profiles: Profile[];
  children: Child[];
  rule: ScheduleRule;
  overrides: ScheduleOverride[];
  appointments: Appointment[];
  tasks: Task[];
}

export interface Store {
  getSnapshot(): Promise<HouseholdSnapshot>;

  upsertOverride(override: ScheduleOverride): Promise<void>;
  removeOverride(date: string): Promise<void>;

  upsertAppointment(appointment: Appointment): Promise<void>;
  removeAppointment(id: string): Promise<void>;

  upsertTask(task: Task): Promise<void>;
  removeTask(id: string): Promise<void>;

  /** Zet alles terug naar het demo-gezin. */
  resetDemo(): Promise<HouseholdSnapshot>;
}
