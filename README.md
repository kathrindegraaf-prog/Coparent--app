# Samen — co-ouderschaps- & gezinsapp (prototype)

Een warme, rustige app die de kinderplanning en de communicatie daaromheen
regelt. Voor ouders die net apart wonen en goed met elkaar willen blijven
afstemmen — **niet** als juridisch bewijssysteem, niet voor high-conflict.

Doel: de dagelijkse mentale belasting verlagen door vier vragen meteen te
beantwoorden: waar zijn de kinderen vandaag, wat staat er gepland, wie regelt
wat, en wat wijkt af van het normale schema.

## Wat er in deze iteratie is gebouwd

Een volledig klikbaar, **lokaal werkend** prototype (nog geen backend, login of
push). Alles draait op AsyncStorage en is direct te testen.

- **Navigatie** — bottom-tabs: **Vandaag**, **Schema**, **Meer**. De app opent
  op Vandaag.
- **Vandaag** — rustig dashboard: datum, bij welke ouder Max & Lotte vandaag
  zijn, volgende wisselmoment, afspraken van vandaag, taken van vandaag en
  morgen, afwijkingen van het schema, en één knop **Toevoegen**.
- **Schema** — verbeterde maandweergave: kleur per ouder (Kathrin terracotta,
  Pieter warm blauw), weekend visueel gescheiden, vandaag met rand, een subtiele
  stip bij afspraken en een rustige ring bij afwijkingen. Tik een dag voor het
  dagdetail; blader per maand.
- **Dagdetail** — verblijf (incl. weekend/overdracht/per-kind), halen & brengen,
  afspraken, taken, extra eet-/contactmomenten en de reden van een afwijking.
  Acties: afspraak toevoegen, taak toevoegen, verblijf eenmalig aanpassen, extra
  eet-/contactmoment.
- **Afspraken** — titel, datum, begin-/eindtijd, kinderen, locatie,
  verantwoordelijke ouder, wie brengt/haalt, notitie en een gekoppelde taak.
  Lokaal toevoegen, bewerken en verwijderen.
- **Taken (mental load)** — titel, kind of algemeen, verantwoordelijke ouder,
  deadline en status open/afgerond. Bewust simpel.
- **Eenmalige aanpassingen** — voor één datum: verblijfsouder wijzigen, per kind
  anders indelen, extra eetmoment bij de andere ouder, een haal-/brengafspraak en
  een korte reden. Verandert het vaste schema nooit permanent.
- **Testbaarheid** — onder **Meer**: “Demodata herstellen” en een pagina
  **Testscenario’s** met tien opdrachten.

De terugkerende planning en de schema-engine uit de vorige stap zijn behouden:
ma+di bij Pieter, wo+do bij Kathrin, weekenden om-en-om (vr-avond t/m zo, met
overdracht op vrijdag). Het schema wordt afgeleid uit regels + overrides — geen
los record per dag.

## Draaien

```bash
npm install
npm start        # Expo Go (iOS/Android) of druk 'w' voor web
```

Kwaliteitschecks:

```bash
npm test         # schema-engine + overrides (18 tests)
npm run typecheck
```

## Testen (kort)

1. Open de app → **Vandaag** laat zien waar de kinderen zijn en de volgende wissel.
2. **Toevoegen** → afspraak/taak/aanpassing.
3. Tik in **Schema** op een dag → dagdetail met alle acties.
4. Onder **Meer → Testscenario’s** staat een lijstje opdrachten; **Demodata
   herstellen** zet alles terug.

## Structuur

```
app/                         expo-router
  (tabs)/  index.tsx (Vandaag), schema.tsx, meer.tsx, _layout.tsx (bottom-tabs)
  day/[date].tsx             dagdetail
  appointment/[id].tsx       afspraak toevoegen/bewerken (modal)
  task/[id].tsx              taak toevoegen/bewerken (modal)
  override/[date].tsx        eenmalige aanpassing (modal)
  scenarios.tsx              testscenario's
src/
  data/       types.ts (datamodel), store.ts (interface), localStore.ts,
              seed.ts (demodata), DataContext.tsx (gedeelde state + CRUD)
  design/     theme.ts (tokens) + components/ (Card, Button, rows, form, …)
  features/schedule/  engine.ts (+tests), MonthGrid.tsx, DayCell.tsx, useSchedule.ts
  i18n/nl.ts  Nederlandse strings
  lib/        date.ts (pure datum-helpers), format.ts
docs/         datamodel.md, privacy.md
```

## Techniek

Expo (React Native) + TypeScript + expo-router. Eén gedeelde `DataProvider`
(context + AsyncStorage) is de bron van waarheid; de datalaag zit achter een
repository-interface (`src/data/store.ts`), zodat later Supabase (EU) ingeplugd
kan worden zonder de UI te raken. Icons via `@expo/vector-icons` (met Expo
meegeleverd); geen nieuwe zware libraries. Web en mobiel werken beide.

Zie [`docs/privacy.md`](docs/privacy.md) voor de AVG-aanpak.
