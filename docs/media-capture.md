# Mash homepage media capture

The homepage shows only real Mash states. This is the one recording session the
page depends on: follow it in order, once, and every screenshot and the hero
film come from the same journey.

Assets land in `public/assets/mash/` and are committed. The capture script does
not run in the site build.

> The media currently shipped was captured from the owner's live Mash session
> at his explicit request, so its titles come from real work rather than the
> neutral demo described below. Recaptures should follow this contract; the
> privacy section applies whenever a capture is taken from a machine that is
> not the owner's own.

## Before recording

- Build or stage Mash from the `mash` repository (`dist/Mash.app`). Do not modify
  that repository for the capture.
- Stage a neutral demo project, `mash-demo`: a small app with two or three
  modules, one failing test, and a change worth reviewing. No employer name, no
  private package, no customer data. Set the Git author to `Mash Demo
  <demo@example.invalid>` and keep history to a handful of ordinary commits.
- Create the demo under a plain path that reads as a demo, for example
  `~/demo/mash-demo`. Nothing under it may reveal a real person, machine, or
  repository.
- Start from a clean first launch, so the ready-made environment is visible.
- Hide everything that is not the story: notifications off, browser closed,
  chat closed, no terminals outside Mash, no shell history on screen.
- Set the Mash theme to Monokai Pro, the window to 1600×1000 (16:10), and the
  window to the same size for every still.
- Set the menu bar clock aside or crop it. No machine-specific UI may appear.

## The journey

Record the whole journey in one pass, at 1600×1000, then cut from it.

1. A workspace open on the demo project, editor on a file, agent pane ready.
2. A task named, opening as its own workspace.
3. A second workspace with its own agent, both agents working at once.
4. The dock or session navigator with three workspaces visible.
5. A hand edit in the editor beside the agent that proposed the change.
6. A review tab on the resulting diff, scrolled to a readable hunk.
7. The command palette open with real shortcuts printed beside the commands.
8. The finished change, reviewed, with the workspace back at rest.

## Exports

- `hero-film.mp4`: 16:10, under 45 seconds, silent, muted playback, H.264, under
  8 MB. Cut so a newcomer can follow idea → agents → hand edit → review → result.
- `hero-film-poster.webp`: 1600×1000, the first frame that reads as a workspace.
- `setup.png`, `workspaces.png`, `human-control.png`, `review.png`,
  `keyboard.png`: 1620×1012 stills, one per journey beat above, cropped from the
  recording so they match the film exactly.
- `loop-1.png` through `loop-4.png`: 800×500 stills for the workflow proof
  (workspace picker, agents beside the editor, review tab, command palette).

The current set was cut from a single recording at 1600×1000. PNG is used
rather than WebP because this machine has no WebP encoder; a tool with libwebp
or `cwebp` can convert them in place without touching the markup beyond the
file extension.

Export stills with ffmpeg, for example:

```bash
# One frame from a 16:10 window recording, cropped past the menu and title bars
ffmpeg -ss 100 -i session.mov -frames:v 1 \
  -vf "crop=1620:1012:0:60,scale=1600:1000:flags=lanczos" still.png
```

If the film ever gains narration or any other audio, add a WebVTT captions track
beside it and point the `<video>` at it. While it stays silent, the accessible
label on the element and the chapter copy carry the story.

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
