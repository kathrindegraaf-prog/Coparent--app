import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { newId, useData } from '@/data/DataContext';
import type { ChildAssignment, ScheduleOverride } from '@/data/types';
import {
  DateField,
  Field,
  FormScreen,
  OptionChips,
  SegmentedControl,
  TextField,
  Toggle,
  type Option,
} from '@/design/components';
import { spacing, typography, usePalette } from '@/design/theme';
import { assignmentFor } from '@/features/schedule/engine';
import { nl } from '@/i18n/nl';
import { todayIso } from '@/lib/date';

const FOLLOW = 'schedule';
const NONE = 'none';

export default function OverrideForm() {
  const p = usePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const { snapshot, parents, children, parentById, saveOverride, deleteOverride } = useData();

  const [date, setDate] = useState(params.date ?? todayIsoLocal());
  const existing = snapshot?.overrides.find((o) => o.date === date) ?? null;

  const base = snapshot ? assignmentFor(date, snapshot.rule, snapshot.overrides.filter((o) => o.date !== date), snapshot.profiles) : null;

  const [stay, setStay] = useState<string>(existing?.assignedTo ?? FOLLOW);
  const [childMap, setChildMap] = useState<Record<string, string[]>>(() => {
    const m: Record<string, string[]> = {};
    for (const ca of existing?.childAssignments ?? []) m[ca.childId] = [ca.parentId];
    return m;
  });
  const [meal, setMeal] = useState<string>(existing?.extraMealParentId ?? NONE);
  const [star, setStar] = useState<boolean>(existing?.isStar ?? false);
  const [logistics, setLogistics] = useState(existing?.logistics ?? '');
  const [reason, setReason] = useState(existing?.reason ?? '');

  const parentOptions: Option[] = parents.map((pr) => ({ id: pr.id, label: pr.displayName, color: pr.color }));
  const stayOptions: Option[] = [{ id: FOLLOW, label: nl.override.followSchedule }, ...parentOptions];
  const mealOptions: Option[] = [{ id: NONE, label: nl.common.none }, ...parentOptions];
  const single = (arr: string[] | undefined, id: string) => (arr?.includes(id) ? [] : [id]);

  const baseParent = base ? parentById(base.parentId) : null;

  const onSave = async () => {
    if (!snapshot) return;
    const childAssignments: ChildAssignment[] = Object.entries(childMap)
      .filter(([, v]) => v.length > 0)
      .map(([childId, v]) => ({ childId, parentId: v[0] }));

    const assignedTo = stay === FOLLOW ? null : stay;
    const extraMealParentId = meal === NONE ? null : meal;
    const hasContent = !!(assignedTo || childAssignments.length || extraMealParentId || star || logistics.trim() || reason.trim());

    if (!hasContent) {
      // Niets meer om te bewaren → verwijder een eventuele bestaande aanpassing.
      if (existing) await deleteOverride(date);
      router.back();
      return;
    }

    const override: ScheduleOverride = {
      id: existing?.id ?? newId('o'),
      householdId: snapshot.household.id,
      date,
      assignedTo,
      childAssignments: childAssignments.length ? childAssignments : undefined,
      extraMealParentId,
      isStar: star,
      logistics: logistics.trim() || undefined,
      reason: reason.trim() || undefined,
      createdBy: parents[0]?.id ?? 'onbekend',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveOverride(override);
    router.back();
  };

  const onDelete = existing
    ? async () => {
        await deleteOverride(date);
        router.back();
      }
    : undefined;

  return (
    <FormScreen
      title={nl.override.newTitle}
      onClose={() => router.back()}
      onSave={onSave}
      onDelete={onDelete}
    >
      <Field label={nl.appointment.date}>
        <DateField value={date} onChange={setDate} />
      </Field>

      {baseParent ? (
        <Text style={[typography.caption, { color: p.textFaint }]}>
          {nl.day.stayTitle} volgens schema: {baseParent.displayName}
        </Text>
      ) : null}

      <Field label={nl.override.stayWith}>
        <SegmentedControl options={stayOptions} value={stay} onChange={setStay} />
      </Field>

      <Field label={nl.override.perChild}>
        <View style={{ gap: spacing.md }}>
          {children.map((c) => (
            <View key={c.id} style={{ gap: spacing.sm }}>
              <Text style={[typography.body, { color: p.text, fontWeight: '600' }]}>{c.name}</Text>
              <OptionChips
                options={parentOptions}
                selected={childMap[c.id] ?? []}
                onToggle={(id) => setChildMap((m) => ({ ...m, [c.id]: single(m[c.id], id) }))}
              />
            </View>
          ))}
        </View>
      </Field>

      <Field label={nl.override.extraMeal}>
        <SegmentedControl options={mealOptions} value={meal} onChange={setMeal} />
      </Field>

      <Toggle value={star} onChange={setStar} label={nl.override.extraContact} />

      <Field label={`${nl.override.logistics} (${nl.common.optional})`}>
        <TextField value={logistics} onChangeText={setLogistics} placeholder={nl.override.logisticsPlaceholder} />
      </Field>

      <Field label={`${nl.override.reason} (${nl.common.optional})`}>
        <TextField value={reason} onChangeText={setReason} placeholder={nl.override.reasonPlaceholder} />
      </Field>

      <View style={[styles_hint, { borderColor: p.border }]}>
        <Text style={[typography.caption, { color: p.textSoft }]}>{nl.override.hint}</Text>
      </View>
    </FormScreen>
  );
}

// kleine helper zodat we todayIso niet dubbel importeren
function todayIsoLocal() {
  return todayIso('Europe/Amsterdam');
}

const styles_hint = {
  borderTopWidth: 1,
  paddingTop: spacing.md,
};
