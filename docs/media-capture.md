# Mash homepage media capture

The homepage shows only real Mash states. The hero film was reshot from the
complete Mash window on 2026-10-25. The chapter stills and workflow frames are
from the earlier capture session and were not reshot with this film.
A separate 2026-10-28 neutral demo supplies the orchestration film; Pi Voice
stills show real recording and editable-transcript states from two takes.

Assets land in `public/assets/mash/` and are committed. The capture script does
not run in the site build.

> Media is captured from the owner's live Mash session at his explicit request,
> so it shows real work rather than a neutral demo. Future recaptures may use the
> public Mash source or a neutral project. Apply the privacy check when the
> owner has not explicitly approved the content on screen.

## Before recording

- Build or stage Mash from the `mash` repository (`dist/Mash.app`). Do not modify
  that repository for the capture.
- Use the public `mash` source workspace or a neutral demo project. If using a
  demo, keep it small: a few modules and a reviewable change.
- Keep the editor, agent pane, and workspace navigation visible. Do not invent
  product states or assemble composite fake UI.
- Hide everything that is not the story: notifications off, browser closed,
  chat closed, no terminals outside Mash, no shell history on screen.
- Set the Mash **window frame** to 1600×1000 (16:10), then independently verify
  that a native window screenshot is exactly 1600×1000. Keep the full Mash
  title bar, sidebar, content, right edge, and status bar in every frame.
- Disable the Cua agent-cursor overlay (`set_agent_cursor_enabled` false) and
  park the real pointer outside the Mash window before recording. Drive the take
  with keyboard shortcuts only, so neither pointer enters the frame.
- Record the display with Mash frontmost. If the recorder captures the display,
  isolate the **whole observed window bounds** from the display recording;
  never crop inside Mash or stretch a larger window to 16:10. Resize first.

## The journey

Record at 1600×1000; edit time, not the spatial frame. A future narrative cut
may use the beats below. The current 26-second film is a real UI tour: editor
and agent → command palette → workspace picker → file finder → review → editor.

1. A workspace open on the demo project, editor on a file, agent pane ready.
2. A task named, opening as its own workspace.
3. A second workspace with its own agent, both agents working at once.
4. The dock or session navigator with three workspaces visible.
5. A hand edit in the editor beside the agent that proposed the change.
6. A review tab on the resulting diff, scrolled to a readable hunk.
7. The command palette open with real shortcuts printed beside the commands.
8. The finished change, reviewed, with the workspace back at rest.

## Exports

- `hero-film.mp4`: the complete 1600×1000 Mash window, 16:10, 26 seconds,
  silent H.264, under 8 MB; the edit removes idle time only.
- `hero-film-poster.png`: 1600×1000, extracted from the first film frame.
- `setup.png`, `workspaces.png`, `human-control.png`, `review.png`,
  `keyboard.png`: 1620×1012 stills from the earlier capture, not this reshoot.
- `loop-1.png` through `loop-4.png`: 800×500 stills for the workflow proof
  (workspace picker, agents beside the editor, review tab, command palette).
- `orchestration-film.mp4`: complete 1600×1000 Mash window, silent H.264,
  15.83 seconds, about 2.4 MB. `orchestration-film-poster.png` is its first
  frame; `orchestration-film.en.vtt` narrates the four actual beats.
- `voice-recording.png` and `voice-transcript.png`: full-window 1600×1000
  states. The recording indicator is from an earlier real Pi Voice take;
  the editable transcript is from the owner's later successful spoken demo.
  They are not frames from one continuous recording. No microphone audio ships.

PNG is used for stills because this machine has no WebP encoder. A WebP
conversion later may reduce bytes without changing the captured states.

The 2026-10-25 full-display recording was 3440×1440; Mash's verified window
bounds were `(x=0, y=30, width=1600, height=1000)`. Only the display *outside*
those exact bounds was removed, with no scale or crop of the Mash window:

```bash
ffmpeg -i recording.mp4 -vf "crop=1600:1000:0:30" -an \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart hero-film.mp4
```

Re-read live window bounds for each new capture; do not reuse these numbers
blindly. Compare a frame from the resulting film against a native screenshot
of the full window, including title bar, right edge, and bottom status bar.
Keep `hero-film.en.vtt` timed to the edit even though the video is silent.

## Orchestration and voice proof

The neutral `/tmp/mash-demo` repository had two small, disjoint tasks: a
blank-name greeting and a finite-number guard. The coordinator dispatched two
Pi workers, answered a real worker question, gathered their completions, and
invited review. The site uses four short intervals from that run rather than
compressing the wide, personal recording supplied as reference. All visible
paths in the exported film belong to the neutral demo.

The display recording was 3440×1440, and the separate Mash demo window was
verified at `(x=0, y=30, width=1600, height=1000)`. Only pixels outside that
entire window were removed; no pane was cropped or rebuilt. The agent cursor
was disabled for the published take; verify no pointer appears in the film.
Check the film's first frame against the full-window
poster and keep `orchestration-film.en.vtt` aligned to the four time cuts.

The voice stills use the same neutral project. The owner explicitly approved
these captures for publication. The recording and transcript stills are
separate genuine states, not a claim that the two images are adjacent frames.
Only the transcript screenshot is published; raw microphone audio is not.

## Privacy check, every frame

Before committing anything, scan each still and the film for:

- a personal or company name, an email address, an avatar
- a private repository, branch, or commit message
- a token, key, connection string, or credential
- a customer or user record
- a home-directory path that is not `mash-demo`
- a notification, badge, calendar item, or unrelated window
- machine-specific history such as recent files or a shell prompt with a hostname

If one appears, re-record that beat. Do not blur a product surface: the page's
claim is that the UI is real.

## Alternative text

Each capture's alt text lives in `app/components/chapters.tsx` and describes the
outcome it proves, in one sentence. Update it if a capture changes meaning, and
keep it free of Fresh references.
