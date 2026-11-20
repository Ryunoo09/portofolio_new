"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicTrack } from "../config";

const VOLUME_KEY = "music-volume";
const MUTED_KEY = "music-muted";
const DEFAULT_VOLUME = 0.5;

function readVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);

    if (raw === null) return DEFAULT_VOLUME;

    const value = Number(raw);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the player still works for this visit.
  }
}

/**
 * US-07: optional background music. Never autoplay, never fetch the file before
 * the first play, and keep the preference without resuming playback on reload.
 */
export function MusicPlayer({ track }: { track: MusicTrack }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const savedVolume = readVolume();
    const savedMuted = readMuted();

    audio.volume = savedVolume;
    audio.muted = savedMuted;
    setVolume(savedVolume);
    setMuted(savedMuted);
  }, []);

  function toggleMute() {
    const audio = audioRef.current;

    if (!audio) return;

    const next = !muted;

    audio.muted = next;
    setMuted(next);
    remember(MUTED_KEY, next ? "1" : "0");
  }

  function changeVolume(next: number) {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = next;
    setVolume(next);
    remember(VOLUME_KEY, String(next));
  }

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      // Autoplay policy, blocked file, or a decode error: stay paused.
      setPlaying(false);
    }
  }

  return (
    <aside
      aria-label="Background music"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[var(--z-player)] max-w-[calc(100vw-2rem)]"
    >
      <audio
        ref={audioRef}
        src={track.src}
        preload="none"
        loop
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="border-border bg-surface/95 flex items-center gap-1.5 rounded-full border p-1 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={togglePlayback}
          aria-pressed={playing}
          aria-label={playing ? "Pause background music" : "Play background music"}
          className="text-fg hover:bg-surface-raised min-h-11 rounded-full px-3 text-xs font-medium transition-colors duration-[var(--duration-fast)]"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <span className="text-fg-muted max-w-[8rem] truncate text-xs sm:max-w-[12rem]">
          {track.title}
        </span>

        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute music" : "Mute music"}
          className="text-fg-muted hover:text-fg min-h-11 rounded-full px-2 text-xs transition-colors duration-[var(--duration-fast)]"
        >
          {muted ? "Unmute" : "Mute"}
        </button>

        <label className="hidden items-center gap-2 pr-2 md:flex">
          <span className="sr-only">Music volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => changeVolume(Number(event.target.value))}
            className="accent-accent w-20"
          />
        </label>
      </div>
    </aside>
  );
}
