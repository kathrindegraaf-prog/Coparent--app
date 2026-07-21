/**
 * Repository-interface voor de datalaag.
 *
 * De UI en de engine praten alléén met deze interface. Nu zit erachter een
 * lokale AsyncStorage-implementatie; in een latere stap komt daar een
 * Supabase-implementatie (EU) achter, zonder dat de UI verandert.
 */

import type {
  Child,
  Household,
  Profile,
  ScheduleOverride,
  ScheduleRule,
} from './types';

export interface HouseholdSnapshot {
  household: Household;
  profiles: Profile[];
  children: Child[];
  rule: ScheduleRule;
  overrides: ScheduleOverride[];
}

export interface Store {
  /** Haal de volledige huidige staat van het (ene) gezin op. */
  getSnapshot(): Promise<HouseholdSnapshot>;
  /** Voeg een override toe of vervang een bestaande voor dezelfde datum. */
  upsertOverride(override: ScheduleOverride): Promise<void>;
  /** Verwijder een override voor een datum (terug naar de regel). */
  removeOverride(date: string): Promise<void>;
}
