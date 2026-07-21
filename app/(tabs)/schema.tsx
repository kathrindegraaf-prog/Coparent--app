import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '@/design/components';
import { spacing, typography, usePalette } from '@/design/theme';
import { MonthGrid } from '@/features/schedule/MonthGrid';
import { useSchedule } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';

export default function ScheduleScreen() {
  const p = usePalette();
  const router = useRouter();
  const schedule = useSchedule();

  return (
    <Screen>
      <Text style={[typography.overline, { color: p.textSoft }]}>{nl.appName}</Text>
      <Text style={[typography.display, { color: p.text, marginBottom: spacing.xl }]}>
        {nl.schedule.title}
      </Text>

      {schedule.loading || !schedule.snapshot ? (
        <View style={{ paddingVertical: spacing.xxxl * 2, alignItems: 'center' }}>
          <ActivityIndicator color={p.parentA.base} />
        </View>
      ) : (
        <MonthGrid
          schedule={schedule}
          onSelectDay={(date) => router.push({ pathname: '/day/[date]', params: { date } })}
        />
      )}
    </Screen>
  );
}
