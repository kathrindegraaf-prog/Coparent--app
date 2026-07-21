/**
 * Screen — standaard schermlayout met veilige marges en scroll. Houdt de inhoud
 * op telefoon-breedte gecentreerd, ook op een breed (web/desktop) scherm.
 */

import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout, spacing, usePalette } from '@/design/theme';

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const pad = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  };
  const inner = { width: '100%' as const, maxWidth: layout.maxContentWidth, alignSelf: 'center' as const };

  if (!scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <View style={[pad, inner, { flex: 1 }]}>{children}</View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={{ ...pad, ...inner }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}
