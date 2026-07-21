import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import {
  Avatar,
  Card,
  FadeInView,
  PressableScale,
  Screen,
  SectionHeader,
} from '@/design/components';
import { AppointmentList, TaskList } from '@/features/lists';
import { radius, spacing, typography, usePalette } from '@/design/theme';
import { UpcomingStrip } from '@/features/schedule/UpcomingStrip';
import { useSchedule, parentInfo } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';
import { addDays, daysBetween } from '@/lib/date';
import { formatDayLong, relativeDay } from '@/lib/format';

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.qaWrap}>
      <View style={[styles.qa, { backgroundColor: p.surface, borderColor: p.border }]}>
        <View style={[styles.qaIcon, { backgroundColor: p.surfaceAlt }]}>
          <Feather name={icon} size={19} color={p.text} />
        </View>
        <Text style={[typography.caption, { color: p.text, fontWeight: '600', textAlign: 'center' }]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

export default function TodayScreen() {
  const p = usePalette();
  const router = useRouter();
  const { snapshot, appointmentsOn, toggleTask } = useData();
  const schedule = useSchedule();

  if (schedule.loading || !snapshot) {
    return (
      <Screen>
        <View style={{ paddingVertical: spacing.xxxl * 2, alignItems: 'center' }}>
          <ActivityIndicator color={p.parentA.base} />
        </View>
      </Screen>
    );
  }

  const today = schedule.today;
  const a = schedule.assignment(today);
  const main = parentInfo(snapshot, a?.parentId ?? null);
  const todaysAppointments = appointmentsOn(today);
  const tomorrow = addDays(today, 1);

  // Herinneringen: open taken tot en met morgen, plus achterstallige.
  const reminders = snapshot.tasks
    .filter((t) => t.status === 'open' && t.deadline && daysBetween(today, t.deadline) <= 1)
    .sort((x, y) => daysBetween(today, x.deadline!) - daysBetween(today, y.deadline!));

  const nextSwitch = schedule.upcomingSwitch;
  const nextSwitchParent = nextSwitch ? parentInfo(snapshot, nextSwitch.parentId) : null;

  return (
    <Screen>
      {/* Kop */}
      <FadeInView>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.overline, { color: p.textSoft }]}>{nl.today.greeting}</Text>
            <Text style={[typography.display, { color: p.text, textTransform: 'capitalize' }]}>
              {formatDayLong(today)}
            </Text>
          </View>
          <PressableScale
            onPress={() => router.push('/assistant')}
            accessibilityRole="button"
            accessibilityLabel={nl.assistant.ask}
            style={[styles.aiPill, { backgroundColor: p.surface, borderColor: p.border }]}
          >
            <Feather name="feather" size={15} color={p.parentA.text} />
            <Text style={[typography.label, { color: p.text }]}>{nl.assistant.ask}</Text>
          </PressableScale>
        </View>
      </FadeInView>

      {/* Hero: waar zijn de kinderen + volgende wissel */}
      <FadeInView delay={40}>
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={[typography.overline, { color: p.textSoft, marginBottom: spacing.md }]}>
            {nl.today.whereAreKids}
          </Text>
          {main ? (
            <View style={styles.heroRow}>
              <Avatar name={main.name} color={main.color} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.title, { color: p.text }]}>
                  {a?.handover ? nl.today.splitToday : nl.today.withParentToday(main.name)}
                </Text>
                {a?.isWeekend ? (
                  <Text style={[typography.body, { color: p.textSoft }]}>{nl.day.weekendBlock}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <Text style={[typography.title, { color: p.textSoft }]}>{nl.schedule.unassigned}</Text>
          )}

          {nextSwitch && nextSwitchParent ? (
            <View style={[styles.switchRow, { borderColor: p.border }]}>
              <Feather name="repeat" size={16} color={p.textSoft} />
              <Text style={[typography.body, { color: p.textSoft }]}>
                {nl.today.nextSwitch}:{' '}
                <Text style={{ color: p.text, fontWeight: '600' }}>{relativeDay(nextSwitch.date, today)}</Text>
                {'  '}→ {nextSwitchParent.name}
              </Text>
            </View>
          ) : null}
        </Card>
      </FadeInView>

      {/* Snelle acties */}
      <FadeInView delay={80}>
        <View style={styles.quickRow}>
          <QuickAction icon="calendar" label={nl.day.addAppointment} onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: 'new', date: today } })} />
          <QuickAction icon="check-square" label={nl.day.addTask} onPress={() => router.push({ pathname: '/task/[id]', params: { id: 'new', deadline: today } })} />
          <QuickAction icon="shuffle" label={nl.today.adjustDay} onPress={() => router.push({ pathname: '/override/[date]', params: { date: today } })} />
        </View>
      </FadeInView>

      {/* Komende dagen */}
      <FadeInView delay={120}>
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={nl.today.comingDays} />
          <UpcomingStrip schedule={schedule} onSelect={(date) => router.push({ pathname: '/day/[date]', params: { date } })} />
        </View>
      </FadeInView>

      {/* Afspraken vandaag */}
      <FadeInView delay={160}>
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={nl.today.appointmentsToday} />
          <Card>
            <AppointmentList
              appointments={todaysAppointments}
              emptyText={nl.today.noAppointments}
              onOpen={(id) => router.push({ pathname: '/appointment/[id]', params: { id } })}
            />
          </Card>
        </View>
      </FadeInView>

      {/* Herinneringen */}
      <FadeInView delay={200}>
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader
            title={nl.today.reminders}
            action={
              <PressableScale onPress={() => router.push('/tasks')} accessibilityRole="button">
                <Text style={[typography.label, { color: p.parentA.text }]}>{nl.today.allTasks}</Text>
              </PressableScale>
            }
          />
          <Card>
            <TaskList
              tasks={reminders}
              today={today}
              showDeadline
              emptyText={nl.today.noReminders}
              onToggle={toggleTask}
              onOpen={(id) => router.push({ pathname: '/task/[id]', params: { id } })}
            />
          </Card>
        </View>
      </FadeInView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  aiPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.xs,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1,
  },
  quickRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  qaWrap: { flex: 1 },
  qa: {
    borderRadius: radius.lg, borderWidth: 1, alignItems: 'center',
    paddingVertical: spacing.lg, gap: spacing.sm,
  },
  qaIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
