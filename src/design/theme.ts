/**
 * Design-tokens — rustig, warm, mobiel-first.
 *
 * Twee oudertinten met genoeg contrast t.o.v. wit én t.o.v. elkaar. De rest is
 * neutraal en zacht (veel witruimte). Licht + donker worden allebei ondersteund.
 */

import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.2 },
  heading: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

/** Oudertinten. `on` = leesbare tekstkleur bovenop de tint (contrast >= 4.5:1). */
export const parentPalette = {
  a: { base: '#2F8F83', soft: '#DCECE9', on: '#FFFFFF' },
  b: { base: '#C9703B', soft: '#F6E7DB', on: '#FFFFFF' },
} as const;

const light = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE6',
  border: '#E7E1D8',
  text: '#2B2A28',
  textSoft: '#6B655C',
  star: '#E0A81E',
  weekendBand: '#F3EEE6',
};

const dark = {
  bg: '#17161A',
  surface: '#201F24',
  surfaceAlt: '#2A2930',
  border: '#34333A',
  text: '#F4F1EC',
  textSoft: '#A7A29B',
  star: '#F0C040',
  weekendBand: '#232228',
};

export type Palette = typeof light & {
  parentA: typeof parentPalette.a;
  parentB: typeof parentPalette.b;
};

/** Hook: geeft het actieve palet op basis van het systeemthema. */
export function usePalette(): Palette {
  const scheme = useColorScheme();
  const base = scheme === 'dark' ? dark : light;
  return { ...base, parentA: parentPalette.a, parentB: parentPalette.b };
}

/** Statische toegang buiten React (bv. seeds). */
export const colors = { light, dark, parent: parentPalette };
