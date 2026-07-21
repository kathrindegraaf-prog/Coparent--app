# Supabase opzetten (gedeelde opslag) — eenmalig

Dit maakt de gedeelde opslag aan zodat jij en Pieter hetzelfde schema zien. Het
project wordt van jou (jouw data, EU-servers). Reken op ~10 minuten. Je hoeft
niet te programmeren — je klikt en plakt.

## 1. Account + project

1. Ga naar **https://supabase.com** → **Start your project** → log in (mag met
   je GitHub- of Google-account).
2. Klik **New project**.
   - **Name:** bijv. `samen`.
   - **Database Password:** klik "Generate" en **bewaar** het ergens (nodig als
     back-up; je hebt het verder niet dagelijks nodig).
   - **Region:** kies een **EU**-regio, bijv. **Central EU (Frankfurt)**.
3. Klik **Create new project** en wacht ~2 minuten tot hij klaar is.

## 2. Het schema installeren

1. In je project: klik links op **SQL Editor** → **New query**.
2. Open in deze repository het bestand
   [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql),
   selecteer **alles** en kopieer het.
3. Plak het in de SQL Editor en klik **Run** (rechtsonder).
   Je zou onderin "Success. No rows returned" moeten zien.

## 3. Anonieme aanmelding aanzetten

Zo kunnen jij en Pieter meedoen met alleen een naam, zonder wachtwoord.

1. Klik links op **Authentication** → **Sign In / Providers** (of **Providers**).
2. Zoek **Anonymous** (Anonymous sign-ins) en zet die **aan** → **Save**.

## 4. De twee gegevens ophalen

1. Klik links op **Project Settings** (tandwiel) → **API**.
2. Kopieer deze twee waarden:
   - **Project URL** (iets als `https://xxxx.supabase.co`)
   - **anon public** key (een lange sleutel onder "Project API keys")

## 5. Aan mij doorgeven

Plak die twee waarden hier in de chat. Ze zijn veilig om te delen: de
anon-sleutel hoort in de app te staan en de echte afscherming zit in de database
(Row Level Security). Ik zet ze daarna in de app en publiceer de gedeelde versie.

> Liever niet in de chat? Je kunt ze ook zelf als GitHub-secrets zetten onder
> **Settings → Secrets and variables → Actions → New repository secret**, met de
> namen `EXPO_PUBLIC_SUPABASE_URL` en `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Laat me
> dan weten dat je dat gedaan hebt.
