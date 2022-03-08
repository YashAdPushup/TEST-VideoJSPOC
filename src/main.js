import videojs from "video.js";
import "videojs-playlist";
import "videojs-contrib-ads";
import "videojs-ima";
import runAuction from "./auction";
import config from "./config/config";
import { logDataToLoggerService } from "./helpers";

const sampleVideos = [
  {
    sources: [
      {
        src: "https://cdn.adpushup.com/instream/42209/content/journaldev1.mp4",
        type: "video/mp4",
      },
    ],
  },
  {
    sources: [
      {
        src: "https://cdn.adpushup.com/instream/42209/content/journaldev2.mp4",
        type: "video/mp4",
      },
    ],
  },

  {
    sources: [
      {
        src: "https://cdn.adpushup.com/instream/42209/content/journaldev3.mp4",
        type: "video/mp4",
      },
    ],
  },
  {
    sources: [
      {
        src: "https://cdn.adpushup.com/instream/42209/content/journaldev4.mp4",
        type: "video/mp4",
      },
    ],
  },
  {
    sources: [
      {
        src: "https://cdn.adpushup.com/instream/42209/content/journaldev5.mp4",
        type: "video/mp4",
      },
    ],
  },
];

var playingFirstTime = true;

function loadIma() {
  return new Promise((resolve, reject) => {
    var script = document.createElement("script");
    script.onload = function () {
      resolve();
    };
    script.src = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";
    document.head.appendChild(script); //or something of the likes
  });
}
function fetchVideoJsStyle() {
  return new Promise((resolve, reject) => {
    let link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.onload = function () {
      resolve();
      console.log("style has loaded");
    };
    link.href = "https://vjs.zencdn.net/7.11.4/video-js.css";

    let headScript = document.querySelector("script");
    headScript.parentNode.insertBefore(link, headScript);
  });
}

function isOutOfViewport(element) {
  var position = element.getBoundingClientRect();
  var outOfView = true;

  if (position.top >= 0 && position.bottom <= window.innerHeight) {
    outOfView = false;
  }
  if (position.top < window.innerHeight && position.bottom >= 0) {
    outOfView = false;
  }
  return outOfView;
}

fetchVideoJsStyle()
  .then(loadIma)
  .then(() => {
    var videoOptions = {
      controlBar: {
        pictureInPictureToggle: false,
      },
    };

    var player = videojs(`#${config.videoPlayerId}`, videoOptions);

    player.playlist(sampleVideos);
    player.currentTime(5); // starting from 5 secs
    // Play through the playlist automatically.
    player.playlist.autoadvance(0);
    player.playlist.repeat(true);

    //hack for journaldev because autoplay isn't working properly
    document.getElementById("page").addEventListener(
      "click",
      function () {
        player.play();
      },
      { once: true }
    );

    var span_obj = document.createElement("span");
    span_obj.innerHTML = "x";
    span_obj.setAttribute("id", "close");

    document.getElementById("ap-player").appendChild(span_obj);
    document.getElementById("close").style.cssText = `
      display:none;
      padding:6px 10px;
      position: absolute;
      font-size: 25px;
      right :5px;
      top:5px;
      cursor :pointer;
  `;

    var pipElemet = null;
    var videoWatched = 0;
    var elementViewed = 0;

    document.addEventListener("scroll", function () {
      var elem = document.querySelector("#video-container");
      var outOfView = isOutOfViewport(elem);
      if (!outOfView) elementViewed++;

      if (outOfView && !pipElemet && videoWatched === 0 && elementViewed > 0) {
        pipElemet = true;
        document.getElementById("ap-player").style.cssText = `
              position: fixed;
              bottom: 0;
              right: 0;
              height: 180px;
              width: 320px;
              z-index:1;
      `;
        document.getElementById("close").style.display = "block";
      } else if (pipElemet && !outOfView) {
        videoWatched = 0;
        pipElemet = null;
        document.getElementById("ap-player").style.cssText = `
        position: relative;
        height: 360px;
        width: 640px;
`;
        document.getElementById("close").style.display = "none";
      }
    });

    document.getElementById("close").addEventListener("click", function () {
      if (player.isFullscreen()) {
        return player.exitFullscreen();
      }

      videoWatched++;
      pipElemet = null;
      document.getElementById("ap-player").style.cssText = `
      position: relative;
      height: 360px;
      width: 640px;
`;
      document.getElementById("close").style.display = "none";
      player.pause();
    });

    player.on("ended", function () {
      runAuction().then((adTag) => {
        var imaOptions = {
          adTagUrl: adTag,
        };

        try {
          if (playingFirstTime) {
            playingFirstTime = false;
            player.ima(imaOptions);
          } else {
            player.ima.changeAdTag(imaOptions.adTagUrl);
            player.ima.requestAds();
          }
          logDataToLoggerService("videoJsSentAdRequest", imaOptions);
        } catch (err) {
          console.log(err);
          logDataToLoggerService("errorInSendingAdRequest", { err });
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
    logDataToLoggerService("errorInMain", { err });
  });
