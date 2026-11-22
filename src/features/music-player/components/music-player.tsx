"use client";

import { useEffect, useRef, useState } from "react";
import type { MusicTrack } from "../config";
import { PlayerIcon } from "./player-icon";

const VOLUME_KEY = "music-volume";
const MUTED_KEY = "music-muted";
const DEFAULT_VOLUME = 0.5;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

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
export function MusicPlayer({ tracks }: { tracks: MusicTrack[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [trackIndex, setTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const resumeAfterTrackChange = useRef(false);
  const track = tracks[trackIndex];

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks.length || !track) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    if (resumeAfterTrackChange.current) {
      resumeAfterTrackChange.current = false;
      void audio.play().catch(() => setPlaying(false));
    }
  }, [trackIndex, track, tracks.length]);

  function selectTrack(index: number) {
    if (tracks.length < 2) return;
    resumeAfterTrackChange.current = playing;
    setTrackIndex((index + tracks.length) % tracks.length);
  }

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

  if (!track) return null;

  return (
    <aside
      aria-label="Background music"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[var(--z-player)] max-w-[calc(100vw-2rem)]"
    >
      <audio ref={audioRef} src={track.src} preload="none" aria-hidden="true" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => tracks.length > 1 ? selectTrack(trackIndex + 1) : setPlaying(false)} onError={() => { setPlaying(false); setDuration(0); setCurrentTime(0); }} />

      <div className="border-border bg-surface/95 w-[min(25rem,calc(100vw-2rem))] rounded-2xl border p-2 shadow-lg backdrop-blur">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span aria-hidden="true" className="bg-accent/15 text-accent grid size-10 shrink-0 place-items-center rounded-full text-lg">♫</span>
          <div className="min-w-0 flex-1">
            <p className="text-fg truncate text-sm font-semibold leading-tight">{track.title}</p>
            <p className="text-fg-muted mt-0.5 text-xs tabular-nums leading-none">{formatTime(currentTime)} / {formatTime(duration)}</p>
          </div>
          {!expanded && (
            <>
              <button type="button" onClick={togglePlayback} aria-pressed={playing} aria-label={playing ? "Pause background music" : "Play background music"} className="bg-accent text-accent-fg grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none">
                <PlayerIcon name={playing ? "pause" : "play"} />
              </button>
              <button type="button" onClick={() => selectTrack(trackIndex + 1)} aria-label="Next track" className="text-fg-muted hover:text-fg grid size-10 shrink-0 place-items-center rounded-full">
                <PlayerIcon name="next" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse music player" : "Expand music player"}
            className="text-fg-muted hover:text-fg grid size-10 shrink-0 place-items-center rounded-full"
          >
            <PlayerIcon name={expanded ? "collapse" : "expand"} />
          </button>
        </div>
        {expanded && (
          <div className="mt-2 flex flex-col gap-2 border-border border-t pt-2">
            {track.credit && (
              <p className="text-fg-muted truncate text-xs">
                {track.creditUrl ? (
                  <a
                    href={track.creditUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-fg underline underline-offset-2"
                  >
                    {track.title ? `${track.title} — ${track.credit}` : track.credit}
                  </a>
                ) : (
                  <>{track.title ? `${track.title} — ${track.credit}` : track.credit}</>
                )}
              </p>
            )}
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="music-seek">Playback position</label>
              <input id="music-seek" aria-label="Playback position" type="range" min={0} max={duration || 0} step={1} value={Math.min(currentTime, duration || 0)} disabled={!duration} onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next) && audioRef.current) {
                  audioRef.current.currentTime = next;
                  setCurrentTime(next);
                }
              }} className="accent-accent min-w-0 flex-1" />
              <span className="text-fg-muted w-[5.5rem] text-right text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <button type="button" onClick={() => selectTrack(trackIndex - 1)} aria-label="Previous track" className="text-fg-muted hover:text-fg grid min-h-11 min-w-11 place-items-center rounded-full">
                <PlayerIcon name="previous" />
              </button>
              <button type="button" onClick={togglePlayback} aria-pressed={playing} aria-label={playing ? "Pause background music" : "Play background music"} className="bg-accent text-accent-fg grid size-12 shrink-0 place-items-center rounded-full transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none">
                <PlayerIcon name={playing ? "pause" : "play"} />
              </button>
              <button type="button" onClick={() => selectTrack(trackIndex + 1)} aria-label="Next track" className="text-fg-muted hover:text-fg grid min-h-11 min-w-11 place-items-center rounded-full">
                <PlayerIcon name="next" />
              </button>
              <span aria-hidden="true" className="mx-1 h-6 border-l border-border" />
              <button type="button" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Unmute music" : "Mute music"} className="text-fg-muted hover:text-fg grid min-h-11 min-w-11 place-items-center rounded-full transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none">
                <PlayerIcon name={muted ? "mute" : "volume"} />
              </button>
              <label className="flex items-center gap-2 pr-2">
                <span className="sr-only">Music volume</span>
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => changeVolume(Number(event.target.value))} className="accent-accent w-16 sm:w-20" />
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
