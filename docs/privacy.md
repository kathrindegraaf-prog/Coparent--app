# Privacy & AVG — vanaf dag één

Privacy is bij deze app ook een verkoopargument. Uitgangspunten:

- **Dataminimalisatie.** We slaan zo min mogelijk op. Van kinderen bewaren we
  alleen een naam. Het dag-schema wordt afgeleid uit regels + overrides, niet als
  losse dagrecords. Geen locatie, geen gedragstracking.
- **Data in de EU.** De backend (Supabase) draait in een EU-regio
  (`eu-central-1`, Frankfurt). Wordt vastgelegd zodra we de backend koppelen.
- **Geen tracking, geen reclame.** Geen advertentie-SDK's, geen analytics die
  personen volgen. Als we ooit anonieme, geaggregeerde productstatistiek willen,
  gebeurt dat opt-in en privacyvriendelijk.
- **Duidelijke verwijderoptie.** Een gezin kan zijn gegevens volledig
  verwijderen. In de Supabase-stap richten we dit in met `on delete cascade` en
  een expliciete "verwijder gezin"-actie in de app.
- **Toegang met minimale rechten.** Straks via Supabase Row Level Security: een
  profiel ziet alleen data van het eigen `household`.
- **Toon.** Rustig en warm, geen juridische framing — dit is geen rechtbank-app.

## Status nu (stap 1)

Alles draait lokaal op het toestel (AsyncStorage). Er verlaat nog geen data het
apparaat. Bovenstaande punten worden concreet ingevuld bij het koppelen van
Supabase.
