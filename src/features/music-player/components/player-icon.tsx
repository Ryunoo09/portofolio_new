type PlayerIconName = "play" | "pause" | "next" | "previous" | "volume" | "mute" | "expand" | "collapse";

export function PlayerIcon({ name }: { name: PlayerIconName }) {
  const paths = {
    play: <path d="m8 5 11 7-11 7V5Z" />,
    pause: <path d="M8 5v14M16 5v14" />,
    next: <><path d="m5 5 10 7-10 7V5Z" /><path d="M19 5v14" /></>,
    previous: <><path d="m19 5-10 7 10 7V5Z" /><path d="M5 5v14" /></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></>,
    mute: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    expand: <path d="M14 5h5v5m0-5-7 7M10 19H5v-5m0 5 7-7" />,
    collapse: <path d="M9 4H4v5m0-5 7 7m4 9h5v-5m0 5-7-7" />,
  };

  return <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
