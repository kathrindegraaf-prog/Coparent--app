/**
 * Datamodel — single source of truth voor de app.
 *
 * Deze types beschrijven precies wat we in de (lokale) datalaag opslaan en later
 * 1-op-1 in Supabase-tabellen mappen. Het dag-schema wordt NIET als losse
 * dagrecords opgeslagen, maar afgeleid uit `ScheduleRule` + `ScheduleOverride[]`.
 */

/** Rol van een ouder binnen het gezin. MVP: twee ouders. */
export type ParentRole = 'parent_a' | 'parent_b';

/** Weekdag als ISO-nummer: 1 = maandag ... 7 = zondag. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Een datum in `YYYY-MM-DD` (lokale kalenderdatum, geen tijdzone). */
export type IsoDate = string;

/** Het gezin / huishouden. */
export interface Household {
  id: string;
  name: string;
  /** IANA-tijdzone, bv. "Europe/Amsterdam". */
  timezone: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

/** Een ouder (of gezinslid) met eigen kleur. */
export interface Profile {
  id: string;
  householdId: string;
  displayName: string;
  role: ParentRole;
  /** Hex-kleur die deze ouder in het schema krijgt, bv. "#2F8F83". */
  color: string;
  isOwner: boolean;
  createdAt: string;
}

/** Een kind binnen het gezin. Dataminimalisatie: alleen een naam nodig. */
export interface Child {
  id: string;
  householdId: string;
  name: string;
  createdAt: string;
}

/**
 * De terugkerende schema-regel. Eén actieve regel per gezin (versioneerbaar via
 * `activeFrom`). Hieruit + de overrides leiden we het volledige schema af.
 */
export interface ScheduleRule {
  id: string;
  householdId: string;
  /** Vanaf welke datum deze regel geldt. */
  activeFrom: IsoDate;

  /**
   * Vaste doordeweekse toewijzing: weekdag (1..5) -> profileId.
   * Dagen die hier niet in staan (bv. vrijdag) vallen onder de weekendregel of
   * blijven onbepaald tot er een override is.
   */
  weekdayAssignment: Partial<Record<IsoWeekday, string>>;

  weekendEnabled: boolean;
  /**
   * Welke dagen tot het weekendblok horen, bv. [5, 6, 7] = vr, za, zo.
   * Bij `fridayHandover` telt vrijdag als overdrachtsdag (overdag nog de
   * doordeweekse ouder, 's avonds/nacht de weekendouder).
   */
  weekendDays: IsoWeekday[];
  /** Weekend start vrijdagavond (overdracht) i.p.v. hele vrijdag. */
  fridayHandover: boolean;
  /** Een bekend weekend (elke datum in dat weekend) als ankerpunt voor de rotatie. */
  weekendAnchorDate: IsoDate;
  /** De ouder die het ankerweekend heeft. Weekends wisselen daarna om-en-om. */
  weekendAnchorParent: string;
}

/** Een override voor één specifieke datum. Wint altijd van de regel. */
export interface ScheduleOverride {
  id: string;
  householdId: string;
  date: IsoDate;
  /** Toegewezen ouder voor deze dag; null = alleen een ster, geen herverdeling. */
  assignedTo: string | null;
  /** "Extra contactmoment" — een ster op de dag. */
  isStar: boolean;
  note?: string;
  createdBy: string;
  createdAt: string;
}

/** Kort bericht, gekoppeld aan een dag/blok. Gedeeld, zichtbaar voor beide ouders. */
export interface Message {
  id: string;
  householdId: string;
  date: IsoDate | null;
  body: string;
  authorId: string;
  createdAt: string;
}

/** Persoonlijk vs gedeeld item (functie 5). */
export interface Item {
  id: string;
  householdId: string;
  ownerId: string;
  visibility: 'personal' | 'shared';
  title: string;
  date: IsoDate | null;
  createdAt: string;
}

/** Uitnodiging via link (functie 6). */
export interface Invite {
  id: string;
  householdId: string;
  token: string;
  roleToAssign: ParentRole;
  expiresAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
}
