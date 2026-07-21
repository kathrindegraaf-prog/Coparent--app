# Datamodel

De bron van waarheid staat in `src/data/types.ts`. Kernidee: **het dag-schema
wordt afgeleid**, niet opgeslagen. We bewaren alleen de regels en de
uitzonderingen; de engine (`src/features/schedule/engine.ts`) rekent per datum uit
wie aan de beurt is. Zo loopt het schema oneindig door en blijft de opslag klein
(dataminimalisatie).

## Tabellen (Supabase-mapping, later)

| Tabel | Belangrijkste velden | Rol |
|---|---|---|
| `households` | `name`, `timezone`, `plan` | Het gezin. Eén prijs per gezin. |
| `profiles` | `role` (parent_a/parent_b), `color`, `is_owner` | Ouder met eigen kleur. |
| `children` | `name` | Alleen een naam — meer is niet nodig. |
| `schedule_rules` | `weekday_assignment`, `weekend_*` | De terugkerende regel. |
| `schedule_overrides` | `date`, `assigned_to`, `is_star` | Uitzondering per dag. Wint van de regel. |
| `messages` | `date`, `body`, `author_id` | Kort bericht per dag/blok (functie 3). |
| `items` | `visibility` (personal/shared) | Persoonlijk vs gedeeld (functie 5). |
| `invites` | `token`, `role_to_assign` | Delen via link (functie 6). |

## Schema-regel

- `weekday_assignment`: weekdag (1=ma … 5=vr) → ouder. Dagen die er niet in staan
  vallen onder de weekendregel of blijven onbepaald.
- Weekend: `weekend_days` (bv. `[5,6,7]` = vr, za, zo), `friday_handover` (vrijdag
  is overdrachtsdag: overdag de doordeweekse ouder, 's avonds de weekendouder),
  `weekend_anchor_date` + `weekend_anchor_parent` als ankerpunt. Weekends
  wisselen daarna **om-en-om**.

## Afleiding per dag (engine)

1. Is er een **override** voor die datum? Die wint (toewijzing en/of ster).
2. Zit de dag in het **weekendblok**? Bepaal via het aantal weekenden sinds het
   anker welke ouder aan de beurt is. Vrijdag = overdracht.
3. Anders: **doordeweekse toewijzing** uit de regel.

De logica is puur en volledig unit-getest (`engine.test.ts`).
