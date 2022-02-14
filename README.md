# VideoJS POC

VideoJS POC is a small POC that can be used to show some video content on a site along with showing Ads from winning bids from header bidding and also integrates Ad Units from GAM.

### Config

Config need to added in src/config/config.js

You can refer src/config/sample.config.js

### How to build the bundle?

After defining src/config/config.js

```bash
npm install
npm run build-prod
```

### How to integrate script on a site

Upload bundle.js and a video on the server.

Refer Tag below. Change the highlighted parts accordingly. Use the same id defined in config.

```html
<video
  id="ap-player"
  class="video-js vjs-big-play-centered"
  controls
  preload="auto"
  width="640"
  height="264"
>
  <source src="video5.mp4" type="video/mp4" />
  <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a web
    browser that
  </p>
</video>
<script src="bundle.js"></script>
```

### Testing Locally ?

Build the script in Dev Mode for debugging purposes.

```html
npm install npm run build-dev
```

you can serve the available index.html file in the root.

Run this in root of the repository.

```html
npx serve
```
