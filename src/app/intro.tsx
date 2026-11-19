import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GROUP_COLORS, pads } from '@/data/kit';
import { useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

const slides = [
  { title: 'Tap. Make a beat.', body: '16 pads of drums, percussion, bass and keys. Every pad is a real sound, ready to play.', lit: [0, 5, 10, 15] },
  { title: 'Loop it, then jam over it', body: 'Draw a pattern on the step grid, set the tempo and press play. Your loop is saved for next time.', lit: [0, 2, 4, 6, 8, 12, 14] },
];

/** Two quick screens, shown once, then straight to the pads. */
export default function Intro() {
  const c = usePalette();
  const [, setSeen] = useStoredState('intro-seen', false);
  const [page, setPage] = useState(0);
  const s = slides[page];
  const done = () => {
    setSeen(true);
    router.replace('/');
  };
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.bg }]}>
      <Pressable accessibilityRole="button" onPress={done} style={styles.skip} hitSlop={10}>
        <Text style={{ color: c.muted, fontWeight: '700' }}>Skip</Text>
      </Pressable>
      <View style={styles.body}>
        <View style={styles.grid} accessibilityElementsHidden>
          {pads.map((p, i) => {
            const color = GROUP_COLORS[p.group];
            const on = s.lit.includes(i);
            return <View key={p.id} style={[styles.pad, { backgroundColor: on ? color : `${color}26`, borderColor: color }]} />;
          })}
        </View>
        <Text style={[styles.title, { color: c.text }]}>{s.title}</Text>
        <Text style={[styles.text, { color: c.muted }]}>{s.body}</Text>
      </View>
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {slides.map((x, i) => (
            <View key={x.title} style={{ width: i === page ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === page ? c.primary : c.border }} />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => (page === slides.length - 1 ? done() : setPage(page + 1))} style={[styles.cta, { backgroundColor: c.primary }]}>
          <Text style={[styles.ctaText, { color: c.primaryText }]}>{page === slides.length - 1 ? 'Start making beats' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  skip: { alignSelf: 'flex-end', padding: 16 },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignSelf: 'center', width: 4 * 64 + 3 * 10, marginBottom: 18 },
  pad: { width: 64, height: 64, borderRadius: 16, borderWidth: 2 },
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  text: { fontSize: 17, lineHeight: 25, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 16, alignItems: 'center' },
  cta: { alignSelf: 'stretch', minHeight: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 18, fontWeight: '900' },
});
