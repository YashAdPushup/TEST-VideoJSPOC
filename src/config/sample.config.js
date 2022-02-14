export default {
  prebid: {
    code: "video1",
    mediaTypes: {
      video: {
        playerSize: [640, 480],
        context: "instream",
        mimes: [
          "video/mp4",
          "video/x-flv",
          "video/x-ms-wmv",
          "application/javascript",
          "video/webm",
        ],
        protocols: [2, 3, 5, 6],
        api: [1, 2],
        linearity: 1,
        minduration: 0,
        maxduration: 200,
        skip: 1,
        skippable: true,
        startdelay: 0,
        playbackmethod: [2, 6],
        placement: 1,
      },
    },

    bids: [
      {
        bidder: "appnexus",
        params: {
          placementId: 23729320,
          video: {
            minduration: 1,
            maxduration: 200,
            skippable: true,
            frameworks: [1, 2],
          },
        },
      },

      {
        bidder: "pubmatic",
        params: {
          publisherId: "158261",
          adSlot: "4039517",
          video: {},
        },
      },
      {
        bidder: "rubicon",
        params: {
          accountId: 20616,
          siteId: 402082,
          zoneId: 2252332,
          video: {},
        },
      },
      {
        bidder: "medianet",
        params: {
          cid: "8CUPEPKI9",
          crid: "463882865",
        },
      },
      {
        bidder: "synacormedia",
        params: {
          seatId: "adpush",
          tagId: "96094",
        },
      },
      {
        bidder: "ix",
        params: {
          siteId: "760473",
          video: {},
        },
      },
      {
        bidder: "amx",
        params: {
          tagId: "YWRwdXNodXAuY29t",
        },
      },
      {
        bidder: "nobid",
        params: {
          siteId: 21929081050,
        },
      },

      {
        bidder: "onetag",
        params: {
          pubId: "62f40acb3086a26",
        },
      },

      {
        bidder: "sonobi",
        params: {
          placement_id: "870bcf6ef599eab60908",
        },
      },
      {
        bidder: "yieldmo",
        params: {
          placementId: "2939160609544938066",
          video: {},
        },
      },
    ],
  },
  // gamAdUnit: "/103512698/22661273398",
  gamAdUnit: "/103512698,14629573/AP_42209_Journaldev_Instream_InHouse",
  videoPlayerId: "ap-player",
};
