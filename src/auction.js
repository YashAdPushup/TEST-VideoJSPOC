import pbjs from "prebid.js";
import "prebid.js/modules/appnexusBidAdapter";
import "prebid.js/modules/rubiconBidAdapter";
import "prebid.js/modules/pubmaticBidAdapter";
import "prebid.js/modules/synacormediaBidAdapter";
import "prebid.js/modules/medianetBidAdapter";
import "prebid.js/modules/ixBidAdapter";
import "prebid.js/modules/amxBidAdapter";
import "prebid.js/modules/nobidBidAdapter";
import "prebid.js/modules/onetagBidAdapter";
import "prebid.js/modules/sonobiBidAdapter";
import "prebid.js/modules/yieldmoBidAdapter";
import "prebid.js/modules/dfpAdServerVideo";
import "prebid.js/modules/schain";
import "prebid.js/modules/instreamTracking";
import config from "./config/config"; // to test use toBeDeletedTestConfig
import { logDataToLoggerService } from "./helpers";

var constants = {
  ADSERVER_TARGETING_KEYS: {
    BIDDER: "hb_ap_bidder",
    AD_ID: "hb_ap_adid",
    CPM: "hb_ap_pb",
    SIZE: "hb_ap_size",
    SOURCE: "hb_ap_source",
    FORMAT: "hb_ap_format",
    SITE_ID: "hb_ap_siteid",
    HB_RAN: "hb_ap_ran",
    ADPUSHUP_RAN: "adpushup_ran",
    REFRESH_COUNT: "refreshcount",
    REFRESH_RATE: "refreshrate",
    FLUID: "fluid",
    INFLATED_CPM: "bidInf",
    CONTEXT: "hb_ap_context",
  },
};
var adUnit1 = config.prebid;

pbjs.addAdUnits(adUnit1);

function getBidderSettings() {
  var keys = constants.ADSERVER_TARGETING_KEYS;

  // Set custom default key value pairs
  var bidderSettings = {
    standard: {
      adserverTargeting: [
        {
          key: keys.BIDDER,
          val: function (bidResponse) {
            return bidResponse.bidderCode;
          },
        },
        {
          key: keys.AD_ID,
          val: function (bidResponse) {
            return bidResponse.adId;
          },
        },
        {
          key: keys.CPM,
          val: function (bidResponse) {
            return bidResponse.pbDg; // Densed granularity
          },
        },
        {
          key: keys.FORMAT,
          val: function (bidResponse) {
            return bidResponse.mediaType; // Current Ad Format
          },
        },
        {
          key: keys.CONTEXT,
          val: function () {
            return "instream";
          },
        },
      ],
    },
  };

  return bidderSettings;
}

export default function runAuction() {
  return new Promise((resolve, reject) => {
    var adtag = null;
    pbjs.bidderSettings = getBidderSettings();

    pbjs.processQueue();
    pbjs.setConfig({
      cache: {
        url: "https://prebid.adnxs.com/pbc/v1/cache",
        ignoreBidderCacheKey: true,
      },
      priceGranularity: "dense",
      schain: {
        validation: "strict",
        config: {
          ver: "1.0", //required
          complete: 1, //required
          nodes: [
            //required //SupplyChainNode object
            {
              asi: "adpushup.com", //required
              sid: "88a32a9bb8bd00f53f184a87de57393f", //sample sid
              hp: 1, //required
            },
          ],
        },
      },
      instreamTracking: {
        enabled: true,
        urlPattern: /(prebid\.adnxs\.com\/pbc\/v1\/cache\.*)|(search\.spotxchange\.com\/ad\/vast\.html\?key=\.*)/,
      },
    });

    pbjs.que.push(function () {
      pbjs.onEvent("bidWon", function (e) {
        var bids = e.bidsReceived || [];
        if (bids.length) {
          for (var i = 0; i < bids.length; i++) {
            var modifiedBidData = {};
            var allData = {};
            modifiedBidData["adUnitCode"] = bids[i].adUnitCode;
            modifiedBidData["bidder"] = bids[i].bidder;
            modifiedBidData["adServerTargeting_cpm"] =
              bids[i].adserverTargeting.hb_pb;
            modifiedBidData["format"] = bids[i].mediaType;
            modifiedBidData["cpm"] = bids[i].cpm;
            allData["bidData"] = modifiedBidData;
            allData["siteId"] = 42209;

            logDataToLoggerService("winningVideoJsBids", allData);
          }
        }
      });
    });

    pbjs.requestBids({
      bidsBackHandler: function (bids) {
        try {
          var videoUrl = pbjs.adServers.dfp.buildVideoUrl({
            adUnit: adUnit1,
            params: {
              iu: config.gamAdUnit,
              output: "vast",
              ad_rule: 0,
              description_url: window.location.href,
              sz: "1x1|400x300|640x480|375x251",
            },
          });

          // pbjs.markWinningBidAsUsed({
          //   adUnitCode: 22661273398, // optional if you know the adId
          // });

          adtag = videoUrl;

          resolve(adtag);
        } catch (err) {
          console.log(err);

          logDataToLoggerService("videoJsErrorLogs", { err });
        } finally {
          console.log(bids);

          if (Object.keys(bids).length) {
            const bidDataToLog = Object.assign({}, bids);
            const modifiedBidData = bidDataToLog.video1.bids.map(
              ({
                adId,
                auctionId,
                bidder,
                cpm,
                creativeId,
                currency,
                size,
              }) => ({
                adId,
                auctionId,
                bidder,
                cpm,
                creativeId,
                currency,
                size,
              })
            );

            bidDataToLog.video1.bids = modifiedBidData;

            logDataToLoggerService("videoJsBids", bidDataToLog);
          }
        }
      },
    });
  });
}
