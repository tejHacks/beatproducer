"""Synthesise Beatpd's original sound kit into assets/sounds/*.wav (44.1 kHz, 16-bit mono).

Run: python3 scripts/make-kit.py   (no dependencies — standard library only)
"""
import math, os, random, struct, wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
os.makedirs(OUT, exist_ok=True)
random.seed(7)


def write(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    gain = 0.89 / peak
    with wave.open(os.path.join(OUT, f"{name}.wav"), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s * gain)) * 32767)) for s in samples))


def env(i, n, attack=0.002, decay=6.0):
    t = i / SR
    a = min(1.0, t / attack) if attack else 1.0
    return a * math.exp(-decay * t / (n / SR))


def noise():
    return random.uniform(-1, 1)


def kick(dur=0.45):
    n = int(SR * dur); ph = 0; out = []
    for i in range(n):
        t = i / SR
        f = 45 + 110 * math.exp(-t * 30)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 7) + 0.2 * noise() * math.exp(-t * 300))
    return out


def snare(dur=0.3):
    n = int(SR * dur); out = []
    for i in range(n):
        t = i / SR
        out.append(0.6 * noise() * math.exp(-t * 18) + 0.5 * math.sin(2 * math.pi * 190 * t) * math.exp(-t * 25))
    return out


def clap(dur=0.35):
    n = int(SR * dur); out = []
    for i in range(n):
        t = i / SR
        bursts = sum(math.exp(-(t - k * 0.011) * 140) if t >= k * 0.011 else 0 for k in range(3))
        out.append(noise() * (bursts * 0.6 + 0.4 * math.exp(-t * 14)))
    return out


def hat(dur=0.09, decay=60, hp=True):
    n = int(SR * dur); out = []; prev = 0
    for i in range(n):
        t = i / SR
        x = noise()
        y = x - prev if hp else x  # crude high-pass
        prev = x
        out.append(y * math.exp(-t * decay))
    return out


def tom(freq=140, dur=0.4):
    n = int(SR * dur); ph = 0; out = []
    for i in range(n):
        t = i / SR
        f = freq * (1 + 0.5 * math.exp(-t * 20))
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 9))
    return out


def rim(dur=0.08):
    n = int(SR * dur)
    return [(math.sin(2 * math.pi * 1700 * i / SR) + 0.5 * noise()) * math.exp(-(i / SR) * 90) for i in range(n)]


def shaker(dur=0.18):
    n = int(SR * dur); out = []; prev = 0
    for i in range(n):
        t = i / SR
        x = noise(); y = x - prev; prev = x
        out.append(y * math.sin(math.pi * min(1, t / dur)) ** 2)
    return out


def note(freq, dur=0.6, kind="bass"):
    n = int(SR * dur); out = []
    for i in range(n):
        t = i / SR
        if kind == "bass":
            s = math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(2 * math.pi * 2 * freq * t) + 0.15 * (2 * ((freq * t) % 1) - 1)
            out.append(s * env(i, n, 0.004, 4.5))
        else:  # soft electric-piano-ish
            s = sum(math.sin(2 * math.pi * freq * h * t) / h ** 1.6 for h in (1, 2, 3, 4))
            out.append(s * env(i, n, 0.006, 3.2))
    return out


def chord(freqs, dur=0.9):
    parts = [note(f, dur, "keys") for f in freqs]
    return [sum(p[i] for p in parts) for i in range(len(parts[0]))]


def hz(semitones_from_a4):
    return 440 * 2 ** (semitones_from_a4 / 12)


kit = {
    "kick": kick(), "snare": snare(), "clap": clap(), "hat": hat(),
    "open-hat": hat(0.35, 9), "tom": tom(), "rim": rim(), "shaker": shaker(),
    # Bass: A1, C2, D2, E2 (A minor pentatonic)
    "bass-a": note(hz(-36)), "bass-c": note(hz(-33)), "bass-d": note(hz(-31)), "bass-e": note(hz(-29)),
    # Keys: Am, C, Dm, Em
    "keys-am": chord([hz(-12), hz(-9), hz(-5)]), "keys-c": chord([hz(-9), hz(-5), hz(-2)]),
    "keys-dm": chord([hz(-7), hz(-4), hz(0)]), "keys-em": chord([hz(-5), hz(-2), hz(2)]),
}

for name, samples in kit.items():
    write(name, samples)
    print("wrote", name)
