# Samen — co-ouderschaps- & gezinsapp (MVP)

Een mooie, moderne app die de kinderplanning en de communicatie daaromheen
regelt. Voor gescheiden/apart wonende ouders én gewone gezinnen. Bewust **niet**
voor high-conflict/rechtbank — rustig, warm, mobiel-first, en één prijs per
gezin.

## Status

**Stap 1 — het gedeelde schema (functie 1): werkend.**

- Terugkerend schema dat automatisch doorloopt: vaste weekdagen per ouder +
  weekenden om-en-om (vrijdagavond t/m zondag, met overdracht op vrijdag).
- Maand vooruit/terug, kleur per ouder, weekend visueel gescheiden van
  doordeweeks (blokkenschema).
- Afgeleid uit regels + overrides — geen los record per dag.
- Draait lokaal (AsyncStorage) met een demo-gezin; nog geen backend nodig.

Volgende stappen: dag-override + extra contactmoment bewerken (functie 2),
berichten per dag (functie 3), Supabase (EU) koppelen, push, delen via link.

## Draaien

```bash
npm install
npm start        # open in Expo Go (iOS/Android) of druk 'w' voor web
```

Engine-tests:

```bash
npm test
npm run typecheck
```

## Structuur

```
app/                      expo-router schermen (index = schema, day/[date] = dagdetail)
src/
  data/       types.ts (datamodel), store.ts (interface), localStore.ts, seed.ts
  features/schedule/  engine.ts (+tests), MonthGrid.tsx, DayCell.tsx, useSchedule.ts
  design/theme.ts     tokens: kleur per ouder, licht/donker
  i18n/nl.ts          Nederlandse strings
  lib/date.ts         pure datum-helpers
docs/         datamodel.md, privacy.md (AVG)
```

## Techniek

Expo (React Native) + TypeScript. Backend wordt Supabase in een EU-regio
(auth, Postgres, realtime, push) — de datalaag zit achter een repository-interface
(`src/data/store.ts`), zodat we de lokale store later omwisselen zonder de UI te
raken.

Zie [`docs/privacy.md`](docs/privacy.md) voor de AVG-aanpak (dataminimalisatie,
EU-data, geen tracking, verwijderoptie).
