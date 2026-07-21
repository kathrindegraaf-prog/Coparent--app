/**
 * Designsysteem — warm, rustig, volwassen, premium maar toegankelijk.
 *
 * Gebroken witte achtergrond, donkere chocoladebruine tekst, zacht terracotta
 * voor Kathrin en gedempt warm blauw voor Pieter. Geen felle kleuren, geen
 * gradients. Systeemfonts voor stabiliteit op Expo en web.
 */

import { Platform, useColorScheme } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
});

const systemFontMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
});

export const typography = {
  display: { fontFamily: systemFont, fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.4 },
  title: { fontFamily: systemFont, fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  heading: { fontFamily: systemFontMedium, fontSize: 18, fontWeight: '600' as const },
  bodyLg: { fontFamily: systemFont, fontSize: 17, fontWeight: '400' as const },
  body: { fontFamily: systemFont, fontSize: 15, fontWeight: '400' as const },
  label: { fontFamily: systemFontMedium, fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: { fontFamily: systemFont, fontSize: 12, fontWeight: '500' as const },
  overline: {
    fontFamily: systemFontMedium,
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Oudertinten. `soft` = zachte achtergrondtint, `on` = leesbare tekst bovenop
 * `base` (contrast >= 4.5:1), `text` = de oudertint als tekstkleur op licht.
 */
export const parentPalette = {
  a: { base: '#C1765A', soft: '#F3E3DA', on: '#FFFFFF', text: '#A85C40' }, // Kathrin — terracotta
  b: { base: '#5F7E9B', soft: '#DFE7EE', on: '#FFFFFF', text: '#4E6E8C' }, // Pieter — warm blauw
} as const;

const light = {
  bg: '#FAF6F1', // gebroken wit
  surface: '#FFFFFF',
  surfaceAlt: '#F3ECE3',
  surfaceSunken: '#EFE7DC',
  border: '#EAE1D5',
  borderStrong: '#DDD2C3',
  text: '#33261F', // donker chocoladebruin
  textSoft: '#7A6B5F',
  textFaint: '#A29486',
  star: '#C89B3C',
  starSoft: '#F3E9D2',
  success: '#5E8B6A',
  onColor: '#FFFFFF',
  scrim: 'rgba(40, 28, 22, 0.28)',
};

const dark = {
  bg: '#1C1712',
  surface: '#25201A',
  surfaceAlt: '#2E271F',
  surfaceSunken: '#221D17',
  border: '#3A3128',
  borderStrong: '#463B30',
  text: '#F3EAE0',
  textSoft: '#B3A597',
  textFaint: '#8A7C6E',
  star: '#D9B45A',
  starSoft: '#3A3220',
  success: '#7BA986',
  onColor: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.5)',
};

export type Palette = typeof light & {
  parentA: typeof parentPalette.a;
  parentB: typeof parentPalette.b;
  isDark: boolean;
};

/** Subtiele schaduwen (iOS) / elevation (Android). Rustig, niet zwaar. */
export const shadow = {
  none: {},
  sm: Platform.select({
    ios: {
      shadowColor: '#4A3526',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 1 },
    default: { boxShadow: '0 3px 8px rgba(74,53,38,0.06)' } as object,
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#4A3526',
      shadowOpacity: 0.09,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 3 },
    default: { boxShadow: '0 8px 20px rgba(74,53,38,0.09)' } as object,
  }),
} as const;

/** Hook: geeft het actieve palet op basis van het systeemthema. */
export function usePalette(): Palette {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const base = isDark ? dark : light;
  return { ...base, parentA: parentPalette.a, parentB: parentPalette.b, isDark };
}

/** Statische toegang buiten React (bv. seeds). */
export const colors = { light, dark, parent: parentPalette };
