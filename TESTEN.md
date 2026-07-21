# De app testen op je Mac

Zo krijg je de app draaiend in je browser. Je hoeft niets van programmeren te
weten. Je doet dit in totaal 3 keer klikken + 1 keer wachten.

## Stap 1 — Node.js installeren (maar één keer, ooit)

De app heeft een klein hulpprogramma nodig om te draaien.

1. Ga naar **https://nodejs.org**
2. Klik op de grote knop met **“LTS”** erop en installeer het gedownloade
   bestand (dubbelklik de `.pkg` en klik steeds op “Ga door”).

Heb je dit al eerder gedaan? Dan kun je deze stap overslaan.

## Stap 2 — De app downloaden

1. Open in je browser de projectpagina op GitHub.
2. Klik op de groene knop **“Code”** → **“Download ZIP”**.
3. Zoek het gedownloade zip-bestand (meestal in **Downloads**) en **dubbelklik**
   het om het uit te pakken. Je krijgt nu een map.

## Stap 3 — Starten

1. Open de uitgepakte map.
2. Dubbelklik op **`start-mac.command`**.
   - Zegt je Mac “kan niet worden geopend omdat de ontwikkelaar niet kan worden
     gecontroleerd”? Klik dan met **rechtermuisknop** (of Ctrl + klik) op
     `start-mac.command` → **Openen** → **Openen**. Dit hoeft maar één keer.
3. Er opent een zwart venster. De eerste keer duurt het een paar minuten
   (het installeert zichzelf). Daarna opent je browser vanzelf met de app.
   Gebeurt dat niet? Open dan zelf **http://localhost:8081**.

Klaar! Je kunt nu door de app klikken: **Vandaag**, **Schema** en **Meer**.

**Stoppen:** klik in het zwarte venster en druk `Ctrl` + `C`, of sluit het venster.

**Opnieuw beginnen met verse demodata:** in de app naar **Meer → Demodata
herstellen**.

---

### Liever via Terminal (ook prima)

```bash
cd ~/Downloads/Coparent--app     # of waar je de map hebt uitgepakt
./start-mac.command
```

### Op je telefoon testen (voelt als een echte app)

1. Installeer **Expo Go** uit de App Store / Play Store.
2. Start op je Mac in de projectmap: `npm start`
3. Scan de QR-code (iPhone: Camera-app, Android: vanuit Expo Go).
   Mac en telefoon moeten op hetzelfde wifi zitten.
