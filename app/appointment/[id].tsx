import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { newId, useData } from '@/data/DataContext';
import type { Appointment } from '@/data/types';
import {
  DateField,
  Field,
  FormScreen,
  OptionChips,
  TextField,
  TimeField,
  type Option,
} from '@/design/components';
import { spacing } from '@/design/theme';
import { nl } from '@/i18n/nl';
import { todayIso } from '@/lib/date';

export default function AppointmentForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const { snapshot, parents, children, saveAppointment, deleteAppointment } = useData();

  const existing = useMemo(
    () => snapshot?.appointments.find((a) => a.id === params.id) ?? null,
    [snapshot, params.id]
  );
  const isNew = params.id === 'new';

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.date ?? params.date ?? todayIso('Europe/Amsterdam'));
  const [startTime, setStartTime] = useState(existing?.startTime ?? '');
  const [endTime, setEndTime] = useState(existing?.endTime ?? '');
  const [childIds, setChildIds] = useState<string[]>(existing?.childIds ?? []);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [responsible, setResponsible] = useState<string[]>(existing?.responsibleParentId ? [existing.responsibleParentId] : []);
  const [brings, setBrings] = useState<string[]>(existing?.broughtById ? [existing.broughtById] : []);
  const [picks, setPicks] = useState<string[]>(existing?.pickedUpById ? [existing.pickedUpById] : []);
  const [note, setNote] = useState(existing?.note ?? '');
  const [linkedTask, setLinkedTask] = useState<string[]>(existing?.linkedTaskId ? [existing.linkedTaskId] : []);

  const parentOptions: Option[] = parents.map((p) => ({ id: p.id, label: p.displayName, color: p.color }));
  const childOptions: Option[] = children.map((c) => ({ id: c.id, label: c.name }));
  const taskOptions: Option[] = (snapshot?.tasks ?? []).map((t) => ({ id: t.id, label: t.title }));

  const single = (arr: string[], id: string) => (arr.includes(id) ? [] : [id]);

  const onSave = async () => {
    if (!title.trim()) return;
    const appt: Appointment = {
      id: existing?.id ?? newId('a'),
      householdId: snapshot!.household.id,
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      childIds,
      location: location.trim() || undefined,
      responsibleParentId: responsible[0] ?? null,
      broughtById: brings[0] ?? null,
      pickedUpById: picks[0] ?? null,
      note: note.trim() || undefined,
      linkedTaskId: linkedTask[0] ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveAppointment(appt);
    router.back();
  };

  const onDelete = existing
    ? async () => {
        await deleteAppointment(existing.id);
        router.back();
      }
    : undefined;

  return (
    <FormScreen
      title={isNew ? nl.appointment.newTitle : nl.appointment.editTitle}
      onClose={() => router.back()}
      onSave={onSave}
      saveDisabled={!title.trim()}
      onDelete={onDelete}
    >
      <Field label={nl.appointment.title}>
        <TextField value={title} onChangeText={setTitle} placeholder={nl.appointment.titlePlaceholder} autoFocus={isNew} />
      </Field>

      <Field label={nl.appointment.date}>
        <DateField value={date} onChange={setDate} />
      </Field>

      <View style={{ flexDirection: 'row', gap: spacing.lg }}>
        <Field label={nl.appointment.startTime}>
          <TimeField value={startTime} onChange={setStartTime} />
        </Field>
        <Field label={`${nl.appointment.endTime} (${nl.common.optional})`}>
          <TimeField value={endTime} onChange={setEndTime} />
        </Field>
      </View>

      <Field label={nl.appointment.children}>
        <OptionChips options={childOptions} selected={childIds} multi onToggle={(id) => setChildIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))} />
      </Field>

      <Field label={`${nl.appointment.location} (${nl.common.optional})`}>
        <TextField value={location} onChangeText={setLocation} placeholder={nl.appointment.locationPlaceholder} />
      </Field>

      <Field label={nl.appointment.responsible}>
        <OptionChips options={parentOptions} selected={responsible} onToggle={(id) => setResponsible((s) => single(s, id))} />
      </Field>

      <View style={{ flexDirection: 'row', gap: spacing.xl, flexWrap: 'wrap' }}>
        <Field label={nl.appointment.brings}>
          <OptionChips options={parentOptions} selected={brings} onToggle={(id) => setBrings((s) => single(s, id))} />
        </Field>
        <Field label={nl.appointment.picksUp}>
          <OptionChips options={parentOptions} selected={picks} onToggle={(id) => setPicks((s) => single(s, id))} />
        </Field>
      </View>

      {taskOptions.length ? (
        <Field label={`${nl.appointment.linkedTask} (${nl.common.optional})`}>
          <OptionChips options={taskOptions} selected={linkedTask} onToggle={(id) => setLinkedTask((s) => single(s, id))} />
        </Field>
      ) : null}

      <Field label={`${nl.appointment.note} (${nl.common.optional})`}>
        <TextField value={note} onChangeText={setNote} placeholder={nl.appointment.notePlaceholder} multiline />
      </Field>
    </FormScreen>
  );
}
