import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePalette, spacing, typography } from '@/design/theme';
import { MonthGrid } from '@/features/schedule/MonthGrid';
import { useSchedule } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';
import { todayIso } from '@/lib/date';

export default function ScheduleScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const schedule = useSchedule();
  const today = todayIso('Europe/Amsterdam');

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.lg,
        }}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.kicker, { color: palette.textSoft }]}>{nl.appName}</Text>
          <Text style={[styles.title, { color: palette.text }]}>{nl.schedule.title}</Text>
        </View>

        {schedule.loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.parentA.base} />
          </View>
        ) : (
          <MonthGrid
            schedule={schedule}
            today={today}
            onSelectDay={(date) => router.push(`/day/${date}`)}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: { marginBottom: spacing.xl },
  kicker: { ...typography.label, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.title, fontSize: 30, marginTop: 2 },
  loading: { paddingVertical: spacing.xxl * 2, alignItems: 'center' },
});
