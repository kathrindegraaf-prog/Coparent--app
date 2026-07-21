/**
 * App-configuratie voor de gedeelde opslag.
 *
 * Zolang er geen Supabase-project is ingevuld, draait de app in LOKALE demo-modus
 * (alles op dit toestel, precies zoals nu). Zodra de URL + anon-sleutel bekend
 * zijn, komt de cloud-modus (gedeeld tussen ouders) beschikbaar.
 *
 * De anon-sleutel is bedoeld om in de client te staan en is publiek veilig: de
 * echte afscherming gebeurt in de database met Row Level Security.
 */

// Worden ingevuld zodra het Supabase-project (EU) is aangemaakt. Kan ook via
// EXPO_PUBLIC_-omgevingsvariabelen worden gezet (die winnen).
const FALLBACK_SUPABASE_URL = '';
const FALLBACK_SUPABASE_ANON_KEY = '';

export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY,
};

/** Is de gedeelde (cloud) opslag geconfigureerd? Zo niet: lokale demo-modus. */
export function isCloudConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
