/**
 * Gedeelde lijstcomponenten voor afspraken en taken. Eén plek voor de mapping
 * van data → rij, gebruikt op Vandaag, in het dagdetail en in het takenoverzicht.
 */

import { View } from 'react-native';
import { useData } from '@/data/DataContext';
import type { Appointment, Task } from '@/data/types';
import { EmptyState, EventRow, TaskRow } from '@/design/components';
import { usePalette } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { childrenLabel, formatTime, relativeDay } from '@/lib/format';

export function AppointmentList({
  appointments,
  onOpen,
  emptyText = nl.day.noAppointments,
}: {
  appointments: Appointment[];
  onOpen: (id: string) => void;
  emptyText?: string;
}) {
  const p = usePalette();
  const { snapshot, parentById } = useData();
  if (appointments.length === 0) return <EmptyState icon="calendar" text={emptyText} />;

  return (
    <>
      {appointments.map((appt, i) => {
        const resp = parentById(appt.responsibleParentId);
        return (
          <View key={appt.id}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: p.border }} /> : null}
            <EventRow
              time={formatTime(appt.startTime)}
              title={appt.title}
              subtitle={[childrenLabel(appt.childIds, snapshot?.children ?? []), appt.location].filter(Boolean).join(' · ')}
              accentColor={resp?.color ?? p.borderStrong}
              onPress={() => onOpen(appt.id)}
            />
          </View>
        );
      })}
    </>
  );
}

export function TaskList({
  tasks,
  onToggle,
  onOpen,
  today,
  showDeadline = false,
  emptyText = nl.day.noTasks,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  today?: string;
  showDeadline?: boolean;
  emptyText?: string;
}) {
  const p = usePalette();
  const { parentById, childById } = useData();
  if (tasks.length === 0) return <EmptyState icon="check-circle" text={emptyText} />;

  return (
    <>
      {tasks.map((task, i) => {
        const resp = parentById(task.responsibleParentId);
        const kid = childById(task.childId);
        const meta = [
          showDeadline && task.deadline && today ? relativeDay(task.deadline, today) : '',
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
              onToggle={() => onToggle(task.id)}
              onPress={() => onOpen(task.id)}
            />
          </View>
        );
      })}
    </>
  );
}
