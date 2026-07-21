import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { FadeInView, Screen, SegmentedControl } from '@/design/components';
import { spacing, typography, usePalette } from '@/design/theme';
import { MonthGrid } from '@/features/schedule/MonthGrid';
import { WeekView } from '@/features/schedule/WeekView';
import { useSchedule } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';

export default function ScheduleScreen() {
  const p = usePalette();
  const router = useRouter();
  const schedule = useSchedule();
  const [view, setView] = useState<'month' | 'week'>('month');

  const openDay = (date: string) => router.push({ pathname: '/day/[date]', params: { date } });

  return (
    <Screen>
      <Text style={[typography.overline, { color: p.textSoft }]}>{nl.appName}</Text>
      <Text style={[typography.display, { color: p.text, marginBottom: spacing.lg }]}>{nl.schedule.title}</Text>

      <View style={{ marginBottom: spacing.xl }}>
        <SegmentedControl
          options={[
            { id: 'month', label: nl.schedule.viewMonth },
            { id: 'week', label: nl.schedule.viewWeek },
          ]}
          value={view}
          onChange={(v) => setView(v as 'month' | 'week')}
        />
      </View>

      {schedule.loading || !schedule.snapshot ? (
        <View style={{ paddingVertical: spacing.xxxl * 2, alignItems: 'center' }}>
          <ActivityIndicator color={p.parentA.base} />
        </View>
      ) : (
        <FadeInView key={view}>
          {view === 'month' ? (
            <MonthGrid schedule={schedule} onSelectDay={openDay} />
          ) : (
            <WeekView schedule={schedule} onSelectDay={openDay} />
          )}
        </FadeInView>
      )}
    </Screen>
  );
}
