const request = require("request-promise");
const fs = require("fs");

async function publishToRabbitMqQueue(queue, data) {
  if (!queue || !data) {
    throw new Error(
      "queue name or data not available to utils.publishToRabbitMqQueue"
    );
  }

  const uri = Array.isArray(data)
    ? "http://queuepublisher.adpushup.com/publishBulk"
    : "http://queuepublisher.adpushup.com/publish";
  var options = {
    method: "POST",
    uri: uri,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: {
      queue: queue,
      data: data,
    },
    json: true,
  };

  return request(options).catch((err) => {
    return Promise.reject(err);
  });
}

try {
  const data = fs.readFileSync("./dist/bundle.js", "utf8");
  publishToRabbitMqQueue("CDN_ORIGIN", {
    content: Buffer.from(data).toString("base64"),
    filePath: "/instream/42209/videoJsBundle.js",
  });
} catch (err) {
  console.error(err);
}
