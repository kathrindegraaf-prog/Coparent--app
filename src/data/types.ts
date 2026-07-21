/**
 * Datamodel — single source of truth voor de app.
 *
 * Deze types beschrijven wat we lokaal (AsyncStorage) opslaan. Het dag-schema
 * wordt NIET als losse dagrecords opgeslagen, maar afgeleid uit `ScheduleRule` +
 * `ScheduleOverride[]` door de engine.
 */

/** Rol van een ouder binnen het gezin. MVP: twee ouders. */
export type ParentRole = 'parent_a' | 'parent_b';

/** Weekdag als ISO-nummer: 1 = maandag ... 7 = zondag. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Een datum in `YYYY-MM-DD` (lokale kalenderdatum, geen tijdzone). */
export type IsoDate = string;

/** Tijd als `HH:MM` (24-uurs). */
export type IsoTime = string;

/** Het gezin / huishouden. */
export interface Household {
  id: string;
  name: string;
  timezone: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

/** Een ouder met eigen kleur. */
export interface Profile {
  id: string;
  householdId: string;
  displayName: string;
  role: ParentRole;
  /** Hex-kleur die deze ouder in het schema krijgt. */
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

/** De terugkerende schema-regel. Eén actieve regel per gezin. */
export interface ScheduleRule {
  id: string;
  householdId: string;
  activeFrom: IsoDate;
  /** Weekdag (1..5) -> profileId. Dagen die hier niet in staan vallen onder de weekendregel. */
  weekdayAssignment: Partial<Record<IsoWeekday, string>>;
  weekendEnabled: boolean;
  /** Welke dagen tot het weekendblok horen, bv. [5,6,7] = vr, za, zo. */
  weekendDays: IsoWeekday[];
  /** Weekend start vrijdagavond (overdracht) i.p.v. hele vrijdag. */
  fridayHandover: boolean;
  weekendAnchorDate: IsoDate;
  weekendAnchorParent: string;
}

/** Per-kind afwijkende indeling op één datum. */
export interface ChildAssignment {
  childId: string;
  parentId: string;
}

/**
 * Een eenmalige aanpassing voor één datum. Wint van de regel, maar verandert het
 * terugkerende basisschema nooit permanent.
 */
export interface ScheduleOverride {
  id: string;
  householdId: string;
  date: IsoDate;
  /** Hele dag naar deze ouder; null = geen volledige herverdeling. */
  assignedTo: string | null;
  /** Alleen bepaalde kinderen anders ingedeeld (los van `assignedTo`). */
  childAssignments?: ChildAssignment[];
  /** Extra eetmoment bij deze ouder (bv. zondag eten bij de andere ouder). */
  extraMealParentId?: string | null;
  /** Extra contactmoment (ster). */
  isStar: boolean;
  /** Vrij tekstveld voor een haal-/brengafspraak. */
  logistics?: string;
  /** Korte reden voor de aanpassing. */
  reason?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

/** Een afspraak, gekoppeld aan een dag. */
export interface Appointment {
  id: string;
  householdId: string;
  title: string;
  date: IsoDate;
  startTime?: IsoTime;
  endTime?: IsoTime;
  /** Eén of meer kinderen. Leeg = hele gezin. */
  childIds: string[];
  location?: string;
  /** Verantwoordelijke ouder. */
  responsibleParentId?: string | null;
  /** Wie brengt. */
  broughtById?: string | null;
  /** Wie haalt. */
  pickedUpById?: string | null;
  note?: string;
  /** Gekoppelde taak of meeneemitem. */
  linkedTaskId?: string | null;
  createdAt: string;
}

/** Een taak (mental load). Bewust simpel gehouden. */
export interface Task {
  id: string;
  householdId: string;
  title: string;
  /** Kind waar de taak over gaat; null = algemeen. */
  childId?: string | null;
  responsibleParentId?: string | null;
  /** Deadline als datum. */
  deadline?: IsoDate | null;
  status: 'open' | 'done';
  linkedAppointmentId?: string | null;
  createdAt: string;
}

/** Kort bericht, gekoppeld aan een dag/blok (toekomstige functie 3). */
export interface Message {
  id: string;
  householdId: string;
  date: IsoDate | null;
  body: string;
  authorId: string;
  createdAt: string;
}

/** Persoonlijk vs gedeeld item (toekomstige functie 5). */
export interface Item {
  id: string;
  householdId: string;
  ownerId: string;
  visibility: 'personal' | 'shared';
  title: string;
  date: IsoDate | null;
  createdAt: string;
}

/** Uitnodiging via link (toekomstige functie 6). */
export interface Invite {
  id: string;
  householdId: string;
  token: string;
  roleToAssign: ParentRole;
  expiresAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
}
