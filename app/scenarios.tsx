import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '@/design/components';
import { radius, spacing, typography, usePalette } from '@/design/theme';
import { nl } from '@/i18n/nl';

export default function ScenariosScreen() {
  const p = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.lg,
          gap: spacing.lg,
        }}
      >
        <Text style={[typography.title, { color: p.text }]}>{nl.scenarios.title}</Text>
        <Text style={[typography.body, { color: p.textSoft, lineHeight: 21 }]}>{nl.scenarios.intro}</Text>

        <Card padded={false}>
          {nl.scenarios.items.map((item, i) => (
            <View key={i}>
              {i > 0 ? <View style={{ height: 1, backgroundColor: p.border, marginLeft: 56 }} /> : null}
              <View style={styles.row}>
                <View style={[styles.num, { backgroundColor: p.surfaceAlt }]}>
                  <Text style={[typography.label, { color: p.text }]}>{i + 1}</Text>
                </View>
                <Text style={[typography.body, { color: p.text, flex: 1 }]}>{item}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Button label={nl.common.done} variant="secondary" fullWidth onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  num: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
