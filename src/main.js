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
var shouldPlayVideo = false;
var hasPlaylistStarted = false;
var gotResponseFromGam = false;
var refreshInterval = 7000;
var requestInterval;
var shouldRequestAd = true;
var maxAdRequests = 17;
var isFirstPlayerEnded = true;

var videoOptions = {
  controlBar: {
    pictureInPictureToggle: false,
  },
};

var videoContainerDiv = document.querySelector("#videoAdSlot");
var player = videojs(`#${config.videoPlayerId}`, videoOptions);

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

function buildNewRequest(player, url) {
    var imaOptions = {
      adTagUrl: url,
      vastLoadTimeout: 15000,
      autoPlayAdBreaks : false,
      muted: true
    };

      player.ima.changeAdTag(imaOptions.adTagUrl);
      player.ima.requestAds();
}

function handlePlayList(player) {
    player.playlist(sampleVideos);
    player.playlist.autoadvance(0);
    player.playlist.repeat(true);
}

function addCssAndHandlePictureInPicture(player) {
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
        shouldPlayVideo = false;
        shouldRequestAd = false;
      });

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (player.paused()) {
            shouldPlayVideo = false;
            shouldRequestAd = false;
            return;
          }
          if(player.ads.inAdBreak()) {
            setTimeout(function(){
              if(document.hidden) {
                player.pause();
              }
            }, 25000)
          }
          player.pause();
          shouldPlayVideo = true;
          shouldRequestAd = false;
        } else {
            var elem = document.getElementById("ap-player");
            var outOfView = isOutOfViewport(elem);
            if (!outOfView) {
              if (player.paused() && shouldPlayVideo) {
                shouldRequestAd = true;
                player.play();
              }
              if(playingFirstTime || shouldPlayVideo) {
                shouldRequestAd = true;
              }
              return;
            }
            player.pause();
        }
      });
}


function handleAdsInPlayList() {
  var player = videojs(`#${config.videoPlayerId}`);
  player.on("ended", function() {
    clearInterval(requestInterval);
    if(!shouldRequestAd) {
      player.pause();
      return;
    } 
    if(isFirstPlayerEnded) {
      isFirstPlayerEnded = false;
      gotResponseFromGam = false;
      runAuction().then((adTag) => {
        buildNewRequest(player, adTag);
      } )
      setTimeout(function(){
        player.trigger("ad-requested");
        if (!gotResponseFromGam) {
          sendRequestsUntilResponse(player);
        }
      }, 7000)
    }
  });

  player.on("ad-requested", function() {
    isFirstPlayerEnded = true;
  })
}

function sendRequestsUntilResponse(player) {
  var adBreakTotalRequests = 0;
  requestInterval = setInterval(function(){
    if(gotResponseFromGam) {
      clearInterval(requestInterval);
      return;
    }
    if((player.paused() && !playingFirstTime) || !shouldRequestAd || (adBreakTotalRequests >= maxAdRequests)) {
      return;
    }
    runAuction().then((adTag) => {
      buildNewRequest(player, adTag);
      adBreakTotalRequests++;
    } )
  }, refreshInterval)
}

fetchVideoJsStyle()
  .then(loadIma)
  .then(() => {
    
    function invokeVideoPlayer(url) {

    // var player = videojs(`#${config.videoPlayerId}`, videoOptions);
    player.ready(function() {
      var imaOptions = {
          adTagUrl: url,
          vastLoadTimeout: 15000,
          autoPlayAdBreaks : false,
          muted: true
        };

        try {
          if (playingFirstTime) {
            // playingFirstTime = false;
            videoContainerDiv.style.display = "block";
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
      this.muted(true);
      player.on("adsready", function(e) {
        gotResponseFromGam = true;
        logDataToLoggerService("response_for_instream", {count: 1});
        player.trigger("readyforpreroll");

        isFirstPlayerEnded = false;
        
        player.ima.playAdBreak();
        player.muted(true);

        setTimeout(function(){
          isFirstPlayerEnded = true;
        }, 3000)
        if(hasPlaylistStarted) {
          return;
        }
        shouldPlayVideo = true;
        playingFirstTime = false;
        refreshInterval = 5000;
        maxAdRequests = 2;
        this.play();
        hasPlaylistStarted = true;
      })


      setTimeout(function(){
        if(gotResponseFromGam) {
          return;
        }
        player.trigger("loadstart");
        sendRequestsUntilResponse(player);
      }, 5000)
    })

    handlePlayList(player);

    handleAdsInPlayList(player);

  };

  var playerElem = document.getElementById("ap-player");

  addCssAndHandlePictureInPicture(player);

  document.addEventListener("scroll", function initPlayer(){
    var playerOutOfView = isOutOfViewport(playerElem);
    if(!playerOutOfView) {
      runAuction().then((adTag) => {
        invokeVideoPlayer(adTag);
      })
      document.removeEventListener("scroll", initPlayer);
    }
  })
});
