function logDataToLoggerService(eventName, data) {
  var encodedPayload = window.btoa(JSON.stringify(data));

  const pixel = document.createElement("img");
  pixel.src = `https://aplogger.adpushup.com/log?event=${eventName}&data=${encodedPayload}`;
}

module.exports = { logDataToLoggerService };
