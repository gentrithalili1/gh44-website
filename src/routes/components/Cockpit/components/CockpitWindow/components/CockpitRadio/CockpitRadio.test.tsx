import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MusicProvider } from "#/routes/hooks/useMusic";
import { TRACKS } from "#/routes/hooks/useMusic/utils/tracks";
import { removeGestureListeners, stubAudio } from "#/test/audio";
import { fakeFrames, playFor } from "#/test/motion";
import { renderAt } from "#/test/renderAt";

import { CockpitRadio } from "./CockpitRadio";

const [FIRST_TRACK] = TRACKS;

type User = ReturnType<typeof userEvent.setup>;

async function openCockpit(user: User) {
  await user.keyboard("{Meta>}k{/Meta}");
}

function getRadio() {
  return screen.getByRole("region", { name: "radio" });
}

// The page has loaded the radio and it plays.
async function waitForPlaying(players: ReturnType<typeof stubAudio>) {
  await waitFor(() => expect(players[0]?.paused).toBe(false));
}

// What the radio says is playing, apart from its playlist.
function getNowPlaying() {
  return within(getRadio()).getByRole("status");
}

describe("CockpitRadio", () => {
  afterEach(() => {
    removeGestureListeners();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("plays the first track as the page loads, before the cockpit opens, fading in", async () => {
    fakeFrames();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await act(async () => {});

    const [player] = players;
    expect(player?.currentSrc).toBe("/audio/crystalline.mp3");
    expect(player?.paused).toBe(false);
    expect(player?.volume).toBe(0);
    playFor(800);
    expect(player?.volume).toBeGreaterThan(0);
    expect(player?.volume).toBeLessThan(0.7);
    playFor(1000);
    expect(player?.volume).toBe(0.7);
  });

  it("plays on the visitor's first interaction when the browser blocks autoplay", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "needs-gesture" });
    await renderAt("/");
    await act(async () => {});
    expect(players[0]?.paused).toBe(true);

    await user.keyboard("a");

    await waitForPlaying(players);
  });

  it("plays when the first gesture is a press on the radio's play button", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "needs-gesture" });
    await renderAt("/");
    await act(async () => {});
    await openCockpit(user);
    // Opening the cockpit is a gesture too: stop, so the play button is the one to start it.
    await waitForPlaying(players);
    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    const button = within(getRadio()).getByRole("button", {
      name: "play crystalline by thomas newman",
    });
    // A real press: the page settles between pressing the button down and letting it go.
    await user.pointer({ keys: "[MouseLeft>]", target: button });
    await act(async () => {});
    await user.pointer({ keys: "[/MouseLeft]", target: button });

    expect(
      await within(getRadio()).findByRole("button", { name: "stop the radio" }),
    ).toBeInTheDocument();
  });

  it("fades out on stop", async () => {
    fakeFrames();
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await act(async () => {});
    playFor(1700);
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    const [player] = players;
    expect(player?.paused).toBe(false);
    playFor(700);
    expect(player?.volume).toBe(0);
    expect(player?.paused).toBe(true);
  });

  it("shows what is playing", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);

    await openCockpit(user);

    expect(getNowPlaying()).toHaveTextContent("thomas newman - crystalline");
    expect(within(getRadio()).getByRole("button", { name: "stop the radio" })).toBeInTheDocument();
  });

  it("holds a stop for the visit: no gesture starts it again", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));
    await user.keyboard("{Escape}");

    expect(players).toHaveLength(1);
    // The stop holds for the visit: no gesture starts it again.
    await user.keyboard("a");
    expect(players[0]?.play).toHaveBeenCalledOnce();
  });

  it("plays again from the cockpit after a stop", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));
    await user.click(
      within(getRadio()).getByRole("button", { name: "play crystalline by thomas newman" }),
    );

    expect(
      await within(getRadio()).findByRole("button", { name: "stop the radio" }),
    ).toBeInTheDocument();
    expect(players[0]?.play).toHaveBeenCalledTimes(2);
  });

  it("has nothing to skip to with a single track", async () => {
    stubAudio({ hasTrack: true, autoplay: "allowed" });
    render(
      <MusicProvider tracks={[FIRST_TRACK]}>
        <CockpitRadio />
      </MusicProvider>,
    );

    expect(
      await within(getRadio()).findByRole("button", { name: "previous track" }),
    ).toBeDisabled();
    expect(within(getRadio()).getByRole("button", { name: "next track" })).toBeDisabled();
  });

  it("plays the next and previous track at once while playing, round the list", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "next track" }));
    expect(getNowPlaying()).toHaveTextContent("hans zimmer - s.t.a.y.");
    expect(players[0]?.currentSrc).toBe("/audio/stay.mp3");
    expect(players[0]?.play).toHaveBeenCalledTimes(2);

    await user.click(within(getRadio()).getByRole("button", { name: "previous track" }));
    expect(getNowPlaying()).toHaveTextContent("thomas newman - crystalline");
    await user.click(within(getRadio()).getByRole("button", { name: "previous track" }));
    expect(getNowPlaying()).toHaveTextContent("thomas newman - the starship avalon");
  });

  it("only picks the track while stopped", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);
    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    await user.click(within(getRadio()).getByRole("button", { name: "next track" }));

    expect(getNowPlaying()).toHaveTextContent("hans zimmer - s.t.a.y.");
    expect(
      within(getRadio()).getByRole("button", { name: "play s.t.a.y. by hans zimmer" }),
    ).toBeInTheDocument();
    expect(players[0]?.play).toHaveBeenCalledOnce();
  });

  it("plays the next track when one ends", async () => {
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    const user = userEvent.setup();
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);

    act(() => {
      players[0]?.dispatchEvent(new Event("ended"));
    });

    expect(getNowPlaying()).toHaveTextContent("hans zimmer - s.t.a.y.");
    expect(players[0]?.play).toHaveBeenCalledTimes(2);
  });

  it("is offline, with no controls, while the track is missing", async () => {
    const user = userEvent.setup();
    stubAudio({ hasTrack: false, autoplay: "allowed" });
    await renderAt("/");
    await act(async () => {});
    await openCockpit(user);

    expect(within(getRadio()).getByText("radio offline")).toBeInTheDocument();
    expect(within(getRadio()).queryByRole("button")).not.toBeInTheDocument();
  });

  it("lists every track, and plays the one picked", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);
    const playlist = within(getRadio()).getByRole("list", { name: "playlist" });

    expect(
      within(playlist)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "thomas newman - crystalline",
      "hans zimmer - s.t.a.y.",
      "thomas newman - spacewalk",
      "thomas newman - the starship avalon",
    ]);
    expect(
      within(playlist).getByRole("button", { name: "thomas newman - crystalline" }),
    ).toHaveAttribute("aria-current", "true");

    await user.click(
      within(playlist).getByRole("button", { name: "thomas newman - the starship avalon" }),
    );

    expect(getNowPlaying()).toHaveTextContent("thomas newman - the starship avalon");
    expect(players[0]?.currentSrc).toBe("/audio/the-starship-avalon.mp3");
    expect(
      within(playlist).getByRole("button", { name: "thomas newman - the starship avalon" }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      within(playlist).getByRole("button", { name: "thomas newman - crystalline" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("starts a stopped radio from the track picked", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);
    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    await user.click(within(getRadio()).getByRole("button", { name: "thomas newman - spacewalk" }));

    expect(
      await within(getRadio()).findByRole("button", { name: "stop the radio" }),
    ).toBeInTheDocument();
    expect(players[0]?.currentSrc).toBe("/audio/spacewalk.mp3");
  });

  it("opens and closes the playlist from its toggle on phones", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await waitForPlaying(players);
    await openCockpit(user);
    const toggle = within(getRadio()).getByRole("button", { name: "playlist" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
