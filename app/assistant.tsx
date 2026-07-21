/**
 * Assistent — placeholder voor toekomstige AI-functionaliteit. Nog géén AI:
 * dit scherm reserveert alleen de plek en de architectuur (voorbeeldvragen,
 * invoerbalk uitgeschakeld). Later koppelen we hier een echte assistent aan.
 */

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card, FadeInView } from '@/design/components';
import { layout, radius, spacing, typography, usePalette } from '@/design/theme';
import { nl } from '@/i18n/nl';

export default function AssistantScreen() {
  const p = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[styles.topbar, { paddingTop: insets.top + spacing.sm, borderColor: p.border }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={nl.day.back} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={p.text} />
        </Pressable>
        <Text style={[typography.heading, { color: p.text }]}>{nl.assistant.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <FadeInView style={{ flex: 1 }}>
          <View style={styles.hero}>
            <View style={[styles.glyph, { backgroundColor: p.parentA.soft }]}>
              <Feather name="feather" size={26} color={p.parentA.text} />
            </View>
            <Badge label={nl.assistant.soon} color={p.parentA.text} bg={p.parentA.soft} />
            <Text style={[typography.title, { color: p.text, textAlign: 'center', marginTop: spacing.sm }]}>
              {nl.assistant.ask}
            </Text>
            <Text style={[typography.body, { color: p.textSoft, textAlign: 'center', lineHeight: 21 }]}>
              {nl.assistant.intro}
            </Text>
          </View>

          <Text style={[typography.overline, { color: p.textSoft, marginBottom: spacing.md }]}>
            {nl.assistant.ideasTitle}
          </Text>
          <View style={{ gap: spacing.sm }}>
            {nl.assistant.ideas.map((idea) => (
              <Card key={idea} sunken style={styles.idea}>
                <Feather name="message-circle" size={16} color={p.textFaint} />
                <Text style={[typography.body, { color: p.textSoft, flex: 1 }]}>{idea}</Text>
              </Card>
            ))}
          </View>
        </FadeInView>

        {/* Uitgeschakelde invoerbalk — reserveert de plek voor later. */}
        <View style={[styles.inputBar, { backgroundColor: p.surface, borderColor: p.border }]}>
          <Text style={[typography.body, { color: p.textFaint, flex: 1 }]}>{nl.assistant.inputPlaceholder}</Text>
          <View style={[styles.sendBtn, { backgroundColor: p.surfaceAlt }]}>
            <Feather name="arrow-up" size={18} color={p.textFaint} />
          </View>
        </View>
        <Text style={[typography.caption, { color: p.textFaint, textAlign: 'center', marginTop: spacing.sm }]}>
          {nl.assistant.disclaimer}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1,
  },
  content: {
    flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl,
  },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  glyph: { width: 60, height: 60, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  idea: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderWidth: 1, borderRadius: radius.pill, paddingLeft: spacing.lg, paddingRight: spacing.xs,
    paddingVertical: spacing.xs, marginTop: spacing.lg, minHeight: 52,
  },
  sendBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
