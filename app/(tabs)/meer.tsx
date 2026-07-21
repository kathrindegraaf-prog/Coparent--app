import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useData } from '@/data/DataContext';
import { ActionSheet, Card, Screen, SectionHeader } from '@/design/components';
import { radius, spacing, typography, usePalette } from '@/design/theme';
import { nl } from '@/i18n/nl';

function Row({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const p = usePalette();
  const color = danger ? p.parentA.text : p.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.7 } : null]}
    >
      <View style={[styles.iconWrap, { backgroundColor: p.surfaceAlt }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color, fontWeight: '600' }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: p.textSoft, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Feather name="chevron-right" size={18} color={p.textFaint} /> : null}
    </Pressable>
  );
}

export default function MoreScreen() {
  const p = usePalette();
  const router = useRouter();
  const { snapshot, resetDemo } = useData();
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen>
      <Text style={[typography.overline, { color: p.textSoft }]}>{nl.appName}</Text>
      <Text style={[typography.display, { color: p.text, marginBottom: spacing.xl }]}>{nl.more.title}</Text>

      <SectionHeader title={nl.more.household} />
      <Card style={{ marginBottom: spacing.xl }}>
        <Text style={[typography.heading, { color: p.text }]}>{snapshot?.household.name ?? '—'}</Text>
        <View style={styles.people}>
          {snapshot?.profiles.map((pr) => (
            <View key={pr.id} style={styles.person}>
              <View style={[styles.swatch, { backgroundColor: pr.color }]} />
              <Text style={[typography.body, { color: p.textSoft }]}>{pr.displayName}</Text>
            </View>
          ))}
          <Text style={[typography.body, { color: p.textFaint }]}>
            {snapshot?.children.map((c) => c.name).join(' & ')}
          </Text>
        </View>
      </Card>

      <SectionHeader title={nl.more.overview} />
      <Card padded={false} style={{ marginBottom: spacing.xl }}>
        <Row
          icon="check-square"
          title={nl.tasksScreen.title}
          subtitle={nl.tasksScreen.subtitle}
          onPress={() => router.push('/tasks')}
        />
        <View style={{ height: 1, backgroundColor: p.border, marginLeft: 56 }} />
        <Row
          icon="feather"
          title={nl.assistant.ask}
          subtitle={nl.assistant.intro}
          onPress={() => router.push('/assistant')}
        />
      </Card>

      <SectionHeader title={nl.more.testing} />
      <Card padded={false} style={{ marginBottom: spacing.xl }}>
        <Row
          icon="list"
          title={nl.more.scenarios}
          subtitle={nl.more.scenariosDesc}
          onPress={() => router.push('/scenarios')}
        />
        <View style={{ height: 1, backgroundColor: p.border, marginLeft: 56 }} />
        <Row
          icon="rotate-ccw"
          title={nl.more.restoreDemo}
          subtitle={nl.more.restoreDemoDesc}
          onPress={() => setConfirm(true)}
          danger
        />
      </Card>

      <SectionHeader title={nl.more.about} />
      <Card>
        <Text style={[typography.body, { color: p.textSoft, lineHeight: 21 }]}>{nl.more.aboutDesc}</Text>
        <View style={[styles.privacy, { borderColor: p.border }]}>
          <Feather name="shield" size={15} color={p.success} />
          <Text style={[typography.caption, { color: p.textSoft, flex: 1 }]}>{nl.more.privacy}</Text>
        </View>
      </Card>

      <ActionSheet
        visible={confirm}
        onClose={() => setConfirm(false)}
        title={nl.more.restoreConfirmDesc}
        actions={[
          {
            label: nl.more.restoreConfirm,
            icon: 'rotate-ccw',
            onPress: async () => {
              await resetDemo();
              router.replace('/');
            },
          },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  iconWrap: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  people: { marginTop: spacing.md, gap: spacing.sm },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  privacy: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1,
  },
});
