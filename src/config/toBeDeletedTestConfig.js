//TO BE DELETED FILE

export default {
  prebid: {
    code: "video1",
    mediaTypes: {
      video: {
        context: "instream",
        playerSize: [640, 480],
        mimes: ["video/mp4"],
        protocols: [1, 2, 3, 4, 5, 6, 7, 8],
        playbackmethod: [2],
        skip: 1,
      },
    },
    bids: [
      {
        bidder: "appnexus",
        params: {
          placementId: 13232361,
          video: {
            frameworks: [1, 2],
          },
        },
      },
    ],
  },
  gamAdUnit: "/103512698,14629573/Journaldev_Test_Instream_Inhouse",

  videoPlayerId: "ap-player",
};
