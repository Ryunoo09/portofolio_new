import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MusicPlayer, musicConfig } from "@/features/music-player";

const track = {
  title: "Lights — RoaMusic",
  src: "/Light_by_ro.mp3",
  credit: "YouTube Free license via BreakingCopyright",
  creditUrl: "https://breakingcopyright.com/song/roa-lights",
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function renderPlayer() {
  const view = render(<MusicPlayer track={track} />);
  const audio = view.container.querySelector("audio");

  if (!audio) throw new Error("audio element missing");

  return { ...view, audio };
}

describe("MusicPlayer", () => {
  it("never autoplays and does not preload the file", () => {
    const { audio } = renderPlayer();
    const play = vi.spyOn(audio, "play");

    expect(audio).toHaveAttribute("preload", "none");
    expect(audio.autoplay).toBe(false);
    expect(play).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Play background music" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("only asks the audio element to play after the play button is clicked", async () => {
    const { audio } = renderPlayer();
    const play = vi.spyOn(audio, "play").mockResolvedValue();

    fireEvent.click(screen.getByRole("button", { name: "Play background music" }));

    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  });

  it("stays paused when the browser rejects playback", async () => {
    const { audio } = renderPlayer();
    vi.spyOn(audio, "play").mockRejectedValue(new Error("blocked"));

    fireEvent.click(screen.getByRole("button", { name: "Play background music" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Play background music" })).toHaveAttribute(
        "aria-pressed",
        "false",
      ),
    );
  });

  it("remembers mute and volume without starting playback", async () => {
    localStorage.setItem("music-volume", "0.3");
    localStorage.setItem("music-muted", "1");

    const { audio } = renderPlayer();

    await waitFor(() => expect(audio.volume).toBe(0.3));

    expect(audio.muted).toBe(true);
    expect(audio.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Unmute music" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Unmute music" }));

    expect(audio.muted).toBe(false);
    expect(localStorage.getItem("music-muted")).toBe("0");
  });

  it("stores volume changes", () => {
    const { audio } = renderPlayer();
    const slider = screen.getByRole("slider", { name: "Music volume" });

    fireEvent.change(slider, { target: { value: "0.75" } });

    expect(audio.volume).toBe(0.75);
    expect(localStorage.getItem("music-volume")).toBe("0.75");
  });
});

describe("musicConfig", () => {
  it("requires a track path", () => {
    expect(musicConfig({})).toBeNull();
    expect(musicConfig({ music: {} })).toBeNull();
    expect(musicConfig({ music: { track_path: "  " } })).toBeNull();
  });

  it("maps a stored path to the media URL and keeps credit", () => {
    const result = musicConfig({
      music: {
        title: "Lights",
        track_path: "Light_by_ro.mp3",
        credit: "YouTube Free license",
        credit_url: "https://breakingcopyright.com/song/roa-lights",
      },
    });

    expect(result).toEqual({
      title: "Lights",
      src: "/Light_by_ro.mp3",
      credit: "YouTube Free license",
      creditUrl: "https://breakingcopyright.com/song/roa-lights",
    });
  });

  it("drops a credit link that is not http(s)", () => {
    const result = musicConfig({
      music: { track_path: "track.mp3", credit_url: "javascript:alert(1)" },
    });

    expect(result?.creditUrl).toBeNull();
  });
});
