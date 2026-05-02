# Installation

Install Video.js and build your first player with streaming support and accessible controls

Beta Software

Video.js v10 is currently in *beta* . The API may evolve with [feedback🙏](https://github.com/videojs/v10/issues). See the [Changelog](https://github.com/videojs/v10/blob/main/CHANGELOG.md) for recent updates and the [Roadmap](../concepts/v10-roadmap.md) for more details on what’s coming.

Video.js is a **React video player component library** — composable primitives, hooks, and TypeScript types for building accessible, customizable players with minimal bundle size.

<!-- cli:replace installation -->


Run `npx @videojs/cli docs how-to/installation` interactively, or pass all flags:

bash

```
npx @videojs/cli docs how-to/installation \
  --framework <html|react> \
  --preset <video|audio|background-video> \
  --skin <default|minimal> \
  --media <html5-video|html5-audio|hls|background-video> \
  --source-url <url> \
  --install-method <cdn|npm|pnpm|yarn|bun>
```






<!-- /cli:replace installation -->

## CSP

If your application uses a Content Security Policy, you may need to allow additional sources for player features to work correctly.

### Common requirements

*   `media-src` must allow your media URLs.
*   `img-src` must allow any poster or thumbnail image URLs.
*   `connect-src` must allow HLS manifests, playlists, captions, and segment requests when using HLS playback.
*   `media-src blob:` is required when using the HLS player variants, which use MSE-backed playback.
*   `worker-src blob:` is required when using the `hls.js` player variants.
*   `style-src 'unsafe-inline'` is currently required for some player UI and HTML player styling behavior.

### Example

http

```
Content-Security-Policy:
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data: blob:;
  media-src 'self' https: blob:;
  connect-src 'self' https:;
  worker-src 'self' blob:;
```

## See also

[

Skins

Some skins expose CSS custom properties

](../concepts/skins.md)

* * *

That’s it! You now have a fully functional Video.js player. Go forth and play.

Something not quite right? You can [submit an issue](https://github.com/videojs/v10/issues) and ask for help, or explore [other support options](/html5-video-support).

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt