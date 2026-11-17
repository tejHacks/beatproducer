# Beatpd

> A pocket beat pad. Tap, loop, vibe.

## What's built

- **16 pads** in four colour-coded groups — Drums, Perc, Bass (A minor pentatonic), Keys (Am / C / Dm / Em)
- **16-step sequencer** for kick, snare, hat and bass, with a starter groove, 60–180 BPM, and the pattern saved on-device
- Haptics on every hit; one preloaded `expo-audio` player per pad for instant retriggering
- An **original synthesised sound kit** — regenerate or tweak it with `python3 scripts/make-kit.py` (no licensed samples)

## Next

- Multiple kits (Afrobeats, amapiano, lo-fi), record a performance, export a loop as audio
- For tighter timing at high BPM, move scheduling to a native audio engine
## Run it

```bash
npm install          # already done once after scaffolding
npx expo start       # then press i (iOS), a (Android) or w (web)
npm run typecheck
npx expo lint
```

Built on **Expo SDK 58** (React Native 0.88, React 19.3), Expo Router, TypeScript.
Everything is stored on-device with AsyncStorage (`src/lib/storage.ts`); there is no backend yet.

## Structure

- `src/app/` — screens (Expo Router; every file is a route)
- `src/brand.ts` — app name, brand colours, screen titles
- `src/theme.ts` — light/dark design tokens
- `src/components/ui.tsx` — shared UI primitives
