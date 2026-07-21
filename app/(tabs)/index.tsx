import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import {
  ActionSheet,
  Avatar,
  Button,
  Card,
  EmptyState,
  EventRow,
  Screen,
  SectionHeader,
  TaskRow,
} from '@/design/components';
import { radius, spacing, typography, usePalette } from '@/design/theme';
import { useSchedule, parentInfo } from '@/features/schedule/useSchedule';
import { nl } from '@/i18n/nl';
import { addDays } from '@/lib/date';
import { childrenLabel, formatDayLong, formatTime, relativeDay } from '@/lib/format';

export default function TodayScreen() {
  const p = usePalette();
  const router = useRouter();
  const { snapshot, appointmentsOn, parentById, childById, toggleTask } = useData();
  const schedule = useSchedule();
  const [sheet, setSheet] = useState(false);

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

  const soonTasks = snapshot.tasks
    .filter((t) => t.deadline === today || t.deadline === tomorrow)
    .sort((x, y) => Number(x.status === 'done') - Number(y.status === 'done'));

  const nextSwitch = schedule.upcomingSwitch;
  const nextSwitchParent = nextSwitch ? parentInfo(snapshot, nextSwitch.parentId) : null;

  const hasDeviationToday = a?.deviation ?? false;
  const extraMealParent = a?.extraMealParentId ? parentInfo(snapshot, a.extraMealParentId) : null;

  return (
    <Screen>
      {/* Datum */}
      <Text style={[typography.overline, { color: p.textSoft }]}>
        {nl.today.greeting}
      </Text>
      <Text style={[typography.display, { color: p.text, textTransform: 'capitalize', marginBottom: spacing.xl }]}>
        {formatDayLong(today)}
      </Text>

      {/* Hero: waar zijn de kinderen */}
      <Card style={{ marginBottom: spacing.lg }}>
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
              {a?.handover ? (
                <Text style={[typography.body, { color: p.textSoft }]}>
                  {nl.day.dayThenEvening(
                    a.handover.dayParentId ? parentById(a.handover.dayParentId)?.displayName ?? '—' : nl.schedule.unassigned,
                    main.name
                  )}
                </Text>
              ) : a?.isWeekend ? (
                <Text style={[typography.body, { color: p.textSoft }]}>{nl.day.weekendBlock}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={[typography.title, { color: p.textSoft }]}>{nl.schedule.unassigned}</Text>
        )}

        {/* Volgende wissel */}
        {nextSwitch && nextSwitchParent ? (
          <View style={[styles.switchRow, { borderColor: p.border }]}>
            <Feather name="repeat" size={16} color={p.textSoft} />
            <Text style={[typography.body, { color: p.textSoft }]}>
              {nl.today.nextSwitch}: <Text style={{ color: p.text, fontWeight: '600' }}>{relativeDay(nextSwitch.date, today)}</Text>
              {'  '}→ {nextSwitchParent.name}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* Afwijking van het schema */}
      {hasDeviationToday ? (
        <Card sunken style={{ marginBottom: spacing.lg, borderColor: p.star, borderWidth: 1 }}>
          <View style={styles.deviationHead}>
            <Feather name="alert-circle" size={16} color={p.star} />
            <Text style={[typography.label, { color: p.text }]}>{nl.today.deviationTitle}</Text>
          </View>
          {extraMealParent ? (
            <Text style={[typography.body, { color: p.textSoft, marginTop: 4 }]}>
              {nl.schedule.extraMeal}: {extraMealParent.name}
            </Text>
          ) : null}
          {a?.reason ? (
            <Text style={[typography.body, { color: p.textSoft, marginTop: 4 }]}>{a.reason}</Text>
          ) : null}
        </Card>
      ) : null}

      {/* Afspraken vandaag */}
      <SectionHeader title={nl.today.appointmentsToday} />
      <Card style={{ marginBottom: spacing.xl }}>
        {todaysAppointments.length === 0 ? (
          <EmptyState icon="calendar" text={nl.today.noAppointments} />
        ) : (
          todaysAppointments.map((appt, i) => {
            const resp = parentById(appt.responsibleParentId);
            return (
              <View key={appt.id}>
                {i > 0 ? <View style={{ height: 1, backgroundColor: p.border }} /> : null}
                <EventRow
                  time={formatTime(appt.startTime)}
                  title={appt.title}
                  subtitle={[childrenLabel(appt.childIds, snapshot.children), appt.location].filter(Boolean).join(' · ')}
                  accentColor={resp?.color ?? p.borderStrong}
                  onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: appt.id } })}
                />
              </View>
            );
          })
        )}
      </Card>

      {/* Taken vandaag en morgen */}
      <SectionHeader title={nl.today.tasksSoon} />
      <Card style={{ marginBottom: spacing.xl }}>
        {soonTasks.length === 0 ? (
          <EmptyState icon="check-circle" text={nl.today.noTasks} />
        ) : (
          soonTasks.map((task, i) => {
            const resp = parentById(task.responsibleParentId);
            const kid = childById(task.childId);
            const meta = [
              task.deadline ? relativeDay(task.deadline, today) : '',
              kid ? kid.name : nl.common.general,
              resp ? nl.day.responsible(resp.displayName) : '',
            ].filter(Boolean).join(' · ');
            return (
              <View key={task.id}>
                {i > 0 ? <View style={{ height: 1, backgroundColor: p.border }} /> : null}
                <TaskRow
                  title={task.title}
                  meta={meta}
                  done={task.status === 'done'}
                  accentColor={resp?.color}
                  onToggle={() => toggleTask(task.id)}
                  onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
                />
              </View>
            );
          })
        )}
      </Card>

      {/* Eén primaire actie */}
      <Button label={nl.today.add} icon="plus" fullWidth onPress={() => setSheet(true)} />

      <ActionSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={nl.today.add}
        actions={[
          {
            label: nl.day.addAppointment,
            icon: 'calendar',
            onPress: () => router.push({ pathname: '/appointment/[id]', params: { id: 'new', date: today } }),
          },
          {
            label: nl.day.addTask,
            icon: 'check-square',
            onPress: () => router.push({ pathname: '/task/[id]', params: { id: 'new', deadline: today } }),
          },
          {
            label: nl.day.adjustStay,
            icon: 'shuffle',
            onPress: () => router.push({ pathname: '/override/[date]', params: { date: today } }),
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  deviationHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
