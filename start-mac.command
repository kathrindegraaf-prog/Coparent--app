#!/bin/bash
# Dubbelklik dit bestand (of run ./start-mac.command in Terminal) om de app te
# starten. Het installeert zo nodig de pakketten en opent de webversie in je
# browser. Stoppen: klik in dit venster en druk Ctrl + C.

cd "$(dirname "$0")" || exit 1

echo ""
echo "  Samen — de app starten"
echo "  ----------------------"
echo ""

# 1. Is Node.js aanwezig?
if ! command -v node >/dev/null 2>&1; then
  echo "  ⚠  Node.js is nog niet geïnstalleerd."
  echo ""
  echo "  Doe dit eerst (eenmalig):"
  echo "   1. Ga naar https://nodejs.org"
  echo "   2. Download de knop met 'LTS' en installeer (dubbelklik de .pkg)."
  echo "   3. Dubbelklik dit bestand daarna opnieuw."
  echo ""
  read -r -p "  Druk op Enter om te sluiten. "
  exit 1
fi

echo "  ✓ Node.js gevonden ($(node -v))"

# 2. Pakketten installeren (alleen de eerste keer).
if [ ! -d node_modules ]; then
  echo "  • Pakketten installeren (eenmalig, dit kan een paar minuten duren)…"
  npm install || {
    echo ""
    echo "  ✗ Installeren lukte niet. Controleer je internetverbinding en probeer opnieuw."
    read -r -p "  Druk op Enter om te sluiten. "
    exit 1
  }
else
  echo "  ✓ Pakketten staan al klaar"
fi

echo ""
echo "  • De webversie start nu op. Je browser opent zo vanzelf."
echo "    Gebeurt dat niet? Open dan zelf: http://localhost:8081"
echo ""
echo "  (Stoppen: klik hier en druk Ctrl + C)"
echo ""

npm run web
