/**
 * @typedef {import("video.js").VideoJsPlayer} Player
 *
 */

var state = {};



function fetchAds() {
    return [
        'videos/video2.mp4',
        'videos/video3.mp4',
        'videos/video4.mp4'
    ]
}
/**
 * 
 * @param {Player} player 
 */
function playAd(player) {

    if (!state.ads || state.ads.length === 0) {
        console.log("No ads")
        return;
    }

    player.ads.startLinearAdMode();
    state.adPlaying = true;

    var media = state.ads[Math.floor(Math.random() * state.ads.length)];
    player.src(media);
    player.trigger('ads-ad-started');

    player.one('adended', function () {
        player.trigger('ads-ad-ended');
        player.ads.endLinearAdMode();
        state.adPlaying = false;
    });



};

/**
 * 
 * @this Player
 */
function adsPlugin(options) {
    var player = this;

    player.on('contentchanged', function () {
        state.ads = fetchAds();
    });

    player.ads(options);

    state.ads = fetchAds();

    player.on('adsready', function () {

    });




    player.on('readyforpostroll', function () {
        if (!state.postrollPlayed) {
            state.postrollPlayed = true;
            playAd(player);
        } else {
            player.trigger('nopostroll');
        }
    });

    player.on('readyforpreroll', function () {
        if (!state.prerollPlayed) {
            state.prerollPlayed = true;
            playAd(player);
        }
    });


    player.on('timeupdate', function (event) {

        var currentTime = player.currentTime();

        if (currentTime > 5 && !state.adPlayed) {
            state.adPlayed = true;
            playAd(player);
        }

    });


}

export default adsPlugin;