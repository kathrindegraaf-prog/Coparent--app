/**
 * Screen — standaard schermlayout met veilige marges en scroll.
 */

import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, usePalette } from '@/design/theme';

export function Screen({
  children,
  scroll = true,
  refreshKey,
}: {
  children: ReactNode;
  scroll?: boolean;
  refreshKey?: string | number;
}) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const pad = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  };
  if (!scroll) {
    return <View style={[{ flex: 1, backgroundColor: p.bg }, pad]}>{children}</View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={pad} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}
