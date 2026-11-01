import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MusicProvider } from "#/routes/hooks/useMusic";
import { TRACKS } from "#/routes/hooks/useMusic/utils/tracks";
import { removeGestureListeners, stubAudio } from "#/test/audio";
import { renderAt } from "#/test/renderAt";

import { CockpitRadio } from "./CockpitRadio";

const [STAY] = TRACKS;

type User = ReturnType<typeof userEvent.setup>;

async function openCockpit(user: User) {
  await user.keyboard("{Meta>}k{/Meta}");
}

function getRadio() {
  return screen.getByRole("region", { name: "radio" });
}

// What the radio says is playing, apart from its playlist.
function getNowPlaying() {
  return within(getRadio()).getByRole("status");
}

describe("CockpitRadio", () => {
  afterEach(() => {
    removeGestureListeners();
    vi.unstubAllGlobals();
  });

  it("shows what is playing", async () => {
    const user = userEvent.setup();
    stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });

    await openCockpit(user);

    expect(getNowPlaying()).toHaveTextContent("hans zimmer - s.t.a.y.");
    expect(within(getRadio()).getByRole("button", { name: "stop the radio" })).toBeInTheDocument();
  });

  it("shares one player with the music button: a stop in the cockpit stops it everywhere", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "play s.t.a.y. by hans zimmer" })).toBeVisible();
    expect(players).toHaveLength(1);
    // The stop holds for the visit: no gesture starts it again.
    await user.keyboard("a");
    expect(players[0]?.play).toHaveBeenCalledOnce();
  });

  it("plays again from the cockpit after a stop", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));
    await user.click(
      within(getRadio()).getByRole("button", { name: "play s.t.a.y. by hans zimmer" }),
    );

    expect(
      await within(getRadio()).findByRole("button", { name: "stop the radio" }),
    ).toBeInTheDocument();
    expect(players[0]?.play).toHaveBeenCalledTimes(2);
  });

  it("has nothing to skip to with a single track", async () => {
    stubAudio({ hasTrack: true, autoplay: "allowed" });
    render(
      <MusicProvider tracks={[STAY]}>
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
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);

    await user.click(within(getRadio()).getByRole("button", { name: "next track" }));
    expect(getNowPlaying()).toHaveTextContent("thomas newman - spacewalk");
    expect(players[0]?.currentSrc).toBe("/audio/spacewalk.mp3");
    expect(players[0]?.play).toHaveBeenCalledTimes(2);

    await user.click(within(getRadio()).getByRole("button", { name: "previous track" }));
    expect(getNowPlaying()).toHaveTextContent("hans zimmer - s.t.a.y.");
    await user.click(within(getRadio()).getByRole("button", { name: "previous track" }));
    expect(getNowPlaying()).toHaveTextContent("thomas newman - crystalline");
  });

  it("only picks the track while stopped", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);
    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    await user.click(within(getRadio()).getByRole("button", { name: "next track" }));

    expect(getNowPlaying()).toHaveTextContent("thomas newman - spacewalk");
    expect(
      within(getRadio()).getByRole("button", { name: "play spacewalk by thomas newman" }),
    ).toBeInTheDocument();
    expect(players[0]?.play).toHaveBeenCalledOnce();
  });

  it("plays the next track when one ends", async () => {
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    const user = userEvent.setup();
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);

    act(() => {
      players[0]?.dispatchEvent(new Event("ended"));
    });

    expect(getNowPlaying()).toHaveTextContent("thomas newman - spacewalk");
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
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);
    const playlist = within(getRadio()).getByRole("list", { name: "playlist" });

    expect(
      within(playlist)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual([
      "hans zimmer - s.t.a.y.",
      "thomas newman - spacewalk",
      "thomas newman - the starship avalon",
      "thomas newman - crystalline",
    ]);
    expect(
      within(playlist).getByRole("button", { name: "hans zimmer - s.t.a.y." }),
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
      within(playlist).getByRole("button", { name: "hans zimmer - s.t.a.y." }),
    ).not.toHaveAttribute("aria-current");
  });

  it("starts a stopped radio from the track picked", async () => {
    const user = userEvent.setup();
    const players = stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);
    await user.click(within(getRadio()).getByRole("button", { name: "stop the radio" }));

    await user.click(
      within(getRadio()).getByRole("button", { name: "thomas newman - crystalline" }),
    );

    expect(
      await within(getRadio()).findByRole("button", { name: "stop the radio" }),
    ).toBeInTheDocument();
    expect(players[0]?.currentSrc).toBe("/audio/crystalline.mp3");
  });

  it("opens and closes the playlist from its toggle on phones", async () => {
    const user = userEvent.setup();
    stubAudio({ hasTrack: true, autoplay: "allowed" });
    await renderAt("/");
    await screen.findByRole("button", { name: "stop the music" });
    await openCockpit(user);
    const toggle = within(getRadio()).getByRole("button", { name: "playlist" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
