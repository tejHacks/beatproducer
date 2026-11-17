/**
 * Preloads one AudioPlayer per pad (so hits start instantly) and retriggers
 * from the top on every tap.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';

import { pads } from '@/data/kit';

export type Players = Record<string, AudioPlayer>;

export function usePadPlayers(): Players {
  // Created once, on first render; released when the screen unmounts.
  const [players] = useState<Players>(() => Object.fromEntries(pads.map((pad) => [pad.id, createAudioPlayer(pad.source)])));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    return () => {
      Object.values(players).forEach((p) => p.remove());
    };
  }, [players]);

  return players;
}

export function trigger(players: Players | null, id: string) {
  const p = players?.[id];
  if (!p) return;
  p.seekTo(0).catch(() => {});
  p.play();
}
