import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/data/DataContext';
import {
  ActionSheet,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  EventRow,
  SectionHeader,
  TaskRow,
} from '@/design/components';
import { spacing, typography, usePalette } from '@/design/theme';
import { assignmentFor } from '@/features/schedule/engine';
import { nl } from '@/i18n/nl';
import { childrenLabel, formatDayLong, formatTime } from '@/lib/format';
import { todayIso } from '@/lib/date';

export default function DayDetailScreen() {
  const p = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { snapshot, appointmentsOn, tasksOn, parentById, childById, toggleTask } = useData();
  const [sheet, setSheet] = useState(false);

  if (!snapshot || !date) return null;

  const a = assignmentFor(date, snapshot.rule, snapshot.overrides, snapshot.profiles);
  const main = parentById(a.parentId);
  const appts = appointmentsOn(date);
  const tasks = tasksOn(date);
  const today = todayIso('Europe/Amsterdam');

  const extraMealParent = a.extraMealParentId ? parentById(a.extraMealParentId) : null;
  const handoverDayParent = a.handover?.dayParentId ? parentById(a.handover.dayParentId) : null;

  // Verzamel haal-/brenginformatie uit de afspraken + de override.
  const logisticsLines: string[] = [];
  for (const appt of appts) {
    const b = parentById(appt.broughtById);
    const u = parentById(appt.pickedUpById);
    if (b) logisticsLines.push(`${appt.title}: ${nl.day.brings(b.displayName)}`);
    if (u) logisticsLines.push(`${appt.title}: ${nl.day.picksUp(u.displayName)}`);
  }
  if (a.logistics) logisticsLines.push(a.logistics);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      {/* Topbar */}
      <View style={[styles.topbar, { paddingTop: insets.top + spacing.sm, borderColor: p.border }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={nl.day.back} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={p.text} />
        </Pressable>
        <Text style={[typography.heading, { color: p.text, textTransform: 'capitalize' }]} numberOfLines={1}>
          {formatDayLong(date)}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xxxl, gap: spacing.lg }}>
        {/* Verblijf */}
        <Card>
          <Text style={[typography.overline, { color: p.textSoft, marginBottom: spacing.md }]}>{nl.day.stayTitle}</Text>
          {main ? (
            <View style={styles.stayRow}>
              <Avatar name={main.displayName} color={main.color} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.heading, { color: p.text }]}>{nl.day.withParent(main.displayName)}</Text>
                {a.handover ? (
                  <Text style={[typography.body, { color: p.textSoft }]}>
                    {nl.day.dayThenEvening(handoverDayParent?.displayName ?? nl.schedule.unassigned, main.displayName)}
                  </Text>
                ) : a.isWeekend ? (
                  <Text style={[typography.body, { color: p.textSoft }]}>{nl.day.weekendBlock}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <Text style={[typography.heading, { color: p.textSoft }]}>{nl.schedule.unassigned}</Text>
          )}

          {/* Per-kind afwijking */}
          {a.childAssignments?.length ? (
            <View style={{ marginTop: spacing.md, gap: 4 }}>
              {a.childAssignments.map((ca) => {
                const kid = childById(ca.childId);
                const par = parentById(ca.parentId);
                return (
                  <Text key={ca.childId} style={[typography.body, { color: p.text }]}>
                    {kid?.name} → {par?.displayName}
                  </Text>
                );
              })}
            </View>
          ) : null}

          <View style={styles.tags}>
            {a.overridden ? <Badge label={nl.day.overridden} color={p.star} bg={p.starSoft} /> : null}
            {a.isStar ? <Badge label={nl.schedule.extraMoment} color={p.star} bg={p.starSoft} /> : null}
            {extraMealParent ? <Badge label={`${nl.schedule.extraMeal}: ${extraMealParent.displayName}`} /> : null}
          </View>

          {a.reason ? (
            <Text style={[typography.body, { color: p.textSoft, marginTop: spacing.md, fontStyle: 'italic' }]}>
              {nl.day.reason}: {a.reason}
            </Text>
          ) : null}
        </Card>

        {/* Halen en brengen */}
        {logisticsLines.length ? (
          <View>
            <SectionHeader title={nl.day.logistics} />
            <Card>
              {logisticsLines.map((line, i) => (
                <View key={i} style={styles.logiRow}>
                  <Feather name="corner-up-right" size={15} color={p.textSoft} />
                  <Text style={[typography.body, { color: p.text, flex: 1 }]}>{line}</Text>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {/* Afspraken */}
        <View>
          <SectionHeader title={nl.day.appointments} />
          <Card>
            {appts.length === 0 ? (
              <EmptyState icon="calendar" text={nl.day.noAppointments} />
            ) : (
              appts.map((appt, i) => {
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
        </View>

        {/* Taken */}
        <View>
          <SectionHeader title={nl.day.tasks} />
          <Card>
            {tasks.length === 0 ? (
              <EmptyState icon="check-circle" text={nl.day.noTasks} />
            ) : (
              tasks.map((task, i) => {
                const resp = parentById(task.responsibleParentId);
                const kid = childById(task.childId);
                return (
                  <View key={task.id}>
                    {i > 0 ? <View style={{ height: 1, backgroundColor: p.border }} /> : null}
                    <TaskRow
                      title={task.title}
                      meta={[kid ? kid.name : nl.common.general, resp ? nl.day.responsible(resp.displayName) : ''].filter(Boolean).join(' · ')}
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
        </View>

        <Button label={nl.common.add} icon="plus" fullWidth onPress={() => setSheet(true)} />
      </ScrollView>

      <ActionSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        actions={[
          { label: nl.day.addAppointment, icon: 'calendar', onPress: () => router.push({ pathname: '/appointment/[id]', params: { id: 'new', date } }) },
          { label: nl.day.addTask, icon: 'check-square', onPress: () => router.push({ pathname: '/task/[id]', params: { id: 'new', deadline: date } }) },
          { label: nl.day.adjustStay, icon: 'shuffle', onPress: () => router.push({ pathname: '/override/[date]', params: { date } }) },
          { label: nl.day.addExtra, icon: 'star', onPress: () => router.push({ pathname: '/override/[date]', params: { date } }) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  stayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  logiRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
});
