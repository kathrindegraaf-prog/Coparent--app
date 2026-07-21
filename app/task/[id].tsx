import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { newId, useData } from '@/data/DataContext';
import type { Task } from '@/data/types';
import {
  DateField,
  Field,
  FormScreen,
  OptionChips,
  TextField,
  Toggle,
  type Option,
} from '@/design/components';
import { nl } from '@/i18n/nl';
import { todayIso } from '@/lib/date';

export default function TaskForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; deadline?: string }>();
  const { snapshot, parents, children, saveTask, deleteTask } = useData();

  const existing = useMemo(
    () => snapshot?.tasks.find((t) => t.id === params.id) ?? null,
    [snapshot, params.id]
  );
  const isNew = params.id === 'new';

  const [title, setTitle] = useState(existing?.title ?? '');
  const [child, setChild] = useState<string[]>(existing?.childId ? [existing.childId] : []);
  const [responsible, setResponsible] = useState<string[]>(existing?.responsibleParentId ? [existing.responsibleParentId] : []);
  const [hasDeadline, setHasDeadline] = useState<boolean>(existing ? !!existing.deadline : true);
  const [deadline, setDeadline] = useState(existing?.deadline ?? params.deadline ?? todayIso('Europe/Amsterdam'));

  const parentOptions: Option[] = parents.map((p) => ({ id: p.id, label: p.displayName, color: p.color }));
  const childOptions: Option[] = children.map((c) => ({ id: c.id, label: c.name }));
  const single = (arr: string[], id: string) => (arr.includes(id) ? [] : [id]);

  const onSave = async () => {
    if (!title.trim()) return;
    const task: Task = {
      id: existing?.id ?? newId('t'),
      householdId: snapshot!.household.id,
      title: title.trim(),
      childId: child[0] ?? null,
      responsibleParentId: responsible[0] ?? null,
      deadline: hasDeadline ? deadline : null,
      status: existing?.status ?? 'open',
      linkedAppointmentId: existing?.linkedAppointmentId ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveTask(task);
    router.back();
  };

  const onDelete = existing
    ? async () => {
        await deleteTask(existing.id);
        router.back();
      }
    : undefined;

  return (
    <FormScreen
      title={isNew ? nl.task.newTitle : nl.task.editTitle}
      onClose={() => router.back()}
      onSave={onSave}
      saveDisabled={!title.trim()}
      onDelete={onDelete}
    >
      <Field label={nl.task.title}>
        <TextField value={title} onChangeText={setTitle} placeholder={nl.task.titlePlaceholder} autoFocus={isNew} />
      </Field>

      <Field label={`${nl.task.about} (${nl.common.optional})`} hint={child.length ? undefined : nl.common.general}>
        <OptionChips options={childOptions} selected={child} onToggle={(id) => setChild((s) => single(s, id))} />
      </Field>

      <Field label={`${nl.task.responsible} (${nl.common.optional})`}>
        <OptionChips options={parentOptions} selected={responsible} onToggle={(id) => setResponsible((s) => single(s, id))} />
      </Field>

      <Field label={nl.task.deadline}>
        <Toggle value={hasDeadline} onChange={setHasDeadline} label={hasDeadline ? nl.task.withDeadline : nl.task.noDeadline} />
        {hasDeadline ? <DateField value={deadline} onChange={setDeadline} /> : null}
      </Field>
    </FormScreen>
  );
}
