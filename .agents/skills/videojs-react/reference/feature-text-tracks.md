# Text tracks

Subtitles, captions, and chapter track state for the player store

Manages subtitles, captions, chapters, and thumbnail tracks.

## API Reference

### State

Property

Type

Details

`chaptersCues`

`MediaTextCue[]`

▸

Description

Cues from the first `kind="chapters"` track.

`thumbnailCues`

`MediaTextCue[]`

▸

Description

Cues from the first `kind="metadata" label="thumbnails"` track.

`thumbnailTrackSrc`

`null | string`

▸

Description

The `<track>` element's `src` for resolving relative cue text URLs.

`textTrackList`

`MediaTextTrack<TextTrackKind>[]`

▸

Description

All text tracks available on the media element.

`subtitlesShowing`

`boolean`

▸

Description

Whether captions/subtitles are currently enabled.

### Actions

Action

Type

Details

`toggleSubtitles`

`(forceShow: boolean) => boolean`

▸

Description

Toggle captions/subtitles visibility. Returns the new enabled value.

### Selector

Pass `selectTextTracks` to [`usePlayer`](use-player.md) to subscribe to text track state. Returns `undefined` if the text tracks feature is not configured.

CaptionsButton.tsx

```
import { selectTextTracks, usePlayer } from '@videojs/react';

function CaptionsButton() {
  const tracks = usePlayer(selectTextTracks);
  if (!tracks) return null;

  return (
    <button onClick={() => tracks.toggleSubtitles()}>
      {tracks.subtitlesShowing ? 'Hide captions' : 'Show captions'}
    </button>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt