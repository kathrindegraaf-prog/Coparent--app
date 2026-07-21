/**
 * Takenoverzicht — een rustige, lichte to-do lijst. Openstaand bovenaan,
 * afgerond eronder. Bewust simpel gehouden.
 */

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import { Button, Card, EmptyState, Screen, SectionHeader } from '@/design/components';
import { spacing, typography, usePalette } from '@/design/theme';
import { TaskList } from '@/features/lists';
import { nl } from '@/i18n/nl';
import { todayIso } from '@/lib/date';

export default function TasksScreen() {
  const p = usePalette();
  const router = useRouter();
  const { snapshot, toggleTask } = useData();
  const today = todayIso('Europe/Amsterdam');

  const tasks = snapshot?.tasks ?? [];
  const byDeadline = (a: { deadline?: string | null }, b: { deadline?: string | null }) =>
    (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999');
  const open = tasks.filter((t) => t.status === 'open').sort(byDeadline);
  const done = tasks.filter((t) => t.status === 'done').sort(byDeadline);

  return (
    <Screen>
      <Text style={[typography.overline, { color: p.textSoft }]}>{nl.appName}</Text>
      <Text style={[typography.display, { color: p.text }]}>{nl.tasksScreen.title}</Text>
      <Text style={[typography.body, { color: p.textSoft, marginTop: spacing.xs, marginBottom: spacing.xl }]}>
        {nl.tasksScreen.subtitle}
      </Text>

      {tasks.length === 0 ? (
        <Card>
          <EmptyState icon="check-circle" text={nl.tasksScreen.empty} />
        </Card>
      ) : (
        <>
          <SectionHeader title={`${nl.tasksScreen.open} · ${open.length}`} />
          <Card style={{ marginBottom: spacing.xl }}>
            <TaskList
              tasks={open}
              today={today}
              showDeadline
              emptyText={nl.today.noReminders}
              onToggle={toggleTask}
              onOpen={(id) => router.push({ pathname: '/task/[id]', params: { id } })}
            />
          </Card>

          {done.length > 0 ? (
            <>
              <SectionHeader title={`${nl.tasksScreen.done} · ${done.length}`} />
              <Card style={{ marginBottom: spacing.xl }}>
                <TaskList
                  tasks={done}
                  today={today}
                  showDeadline
                  onToggle={toggleTask}
                  onOpen={(id) => router.push({ pathname: '/task/[id]', params: { id } })}
                />
              </Card>
            </>
          ) : null}
        </>
      )}

      <Button
        label={nl.tasksScreen.add}
        icon="plus"
        fullWidth
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: 'new', deadline: today } })}
      />
    </Screen>
  );
}
