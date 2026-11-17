import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Label, Row, Screen } from '@/components/ui';
import { GROUP_COLORS, pads, STEPS, starterPattern, TRACKS } from '@/data/kit';
import { trigger, usePadPlayers } from '@/lib/audio';
import { useStoredState } from '@/lib/storage';
import { usePalette } from '@/theme';

type Pattern = Record<(typeof TRACKS)[number], boolean[]>;

/** One-screen beat pad: tap pads live, or loop a 16-step pattern. */
export default function Beatpd() {
  const c = usePalette();
  const players = usePadPlayers();
  const [hit, setHit] = useState<string | null>(null);
  const [pattern, setPattern] = useStoredState<Pattern>('pattern', starterPattern);
  const [bpm, setBpm] = useStoredState('bpm', 100);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const patternRef = useRef(pattern);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  const play = (id: string) => {
    trigger(players, id);
    setHit(id);
    setTimeout(() => setHit((h) => (h === id ? null : h)), 120);
  };

  // Sequencer clock: 16th notes
  useEffect(() => {
    if (!playing) return;
    let s = -1;
    const tick = () => {
      s = (s + 1) % STEPS;
      setStep(s);
      for (const t of TRACKS) if (patternRef.current[t][s]) trigger(players, t);
    };
    tick();
    const id = setInterval(tick, 60000 / bpm / 4);
    return () => clearInterval(id);
  }, [playing, bpm, players]);

  const toggleStep = (t: (typeof TRACKS)[number], i: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPattern((p) => ({ ...p, [t]: p[t].map((v, k) => (k === i ? !v : v)) }));
  };

  return (
    <Screen>
      {/* Pads */}
      <View style={styles.grid}>
        {pads.map((pad) => {
          const color = GROUP_COLORS[pad.group];
          const active = hit === pad.id;
          return (
            <Pressable
              key={pad.id}
              onPressIn={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                play(pad.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${pad.group} ${pad.label}`}
              style={[styles.pad, { backgroundColor: active ? color : `${color}33`, borderColor: color, transform: [{ scale: active ? 0.94 : 1 }] }]}>
              <Text style={[styles.padLabel, { color: active ? '#0B0B0F' : c.text }]}>{pad.label}</Text>
              <Text style={[styles.padGroup, { color: active ? '#0B0B0F' : color }]}>{pad.group}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Transport */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Button
          title={playing ? 'Stop' : 'Play loop'}
          variant={playing ? 'secondary' : 'primary'}
          onPress={() => {
            setPlaying((p) => !p);
            setStep(-1);
          }}
        />
        <Row>
          <Button title="−" variant="secondary" onPress={() => setBpm((b) => Math.max(60, b - 5))} />
          <Text style={[styles.bpm, { color: c.text }]}>{bpm} BPM</Text>
          <Button title="+" variant="secondary" onPress={() => setBpm((b) => Math.min(180, b + 5))} />
        </Row>
      </Row>

      {/* Step sequencer */}
      <View style={{ gap: 8 }}>
        {TRACKS.map((t) => {
          const pad = pads.find((p) => p.id === t)!;
          const color = GROUP_COLORS[pad.group];
          return (
            <View key={t} style={{ gap: 4 }}>
              <Label>{pad.group === 'Bass' ? 'Bass' : pad.label}</Label>
              <View style={styles.steps}>
                {pattern[t].map((on, i) => (
                  <Pressable
                    key={i}
                    onPress={() => toggleStep(t, i)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${pad.label} step ${i + 1}`}
                    style={[
                      styles.step,
                      {
                        backgroundColor: on ? color : c.card,
                        borderColor: i === step ? c.text : i % 4 === 0 ? c.subtle : c.border,
                        opacity: i === step && !on ? 0.6 : 1,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>

      <Button title="Clear pattern" variant="secondary" onPress={() => setPattern({ kick: Array(STEPS).fill(false), snare: Array(STEPS).fill(false), hat: Array(STEPS).fill(false), 'bass-a': Array(STEPS).fill(false) })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pad: { width: '22.5%', aspectRatio: 1, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
  padLabel: { fontSize: 15, fontWeight: '800' },
  padGroup: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  bpm: { fontSize: 16, fontWeight: '800', minWidth: 72, textAlign: 'center', fontVariant: ['tabular-nums'] },
  steps: { flexDirection: 'row', gap: 3 },
  step: { flex: 1, height: 28, borderRadius: 6, borderWidth: 1.5 },
});
