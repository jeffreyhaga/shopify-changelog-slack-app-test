//This is code for a slackbot that checks when Shopify's changelog is updated

const axios = require("axios");
const crypto = require("crypto");
const https = require("https");

const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";
const WEB_PAGE_URL = "https://changelog.shopify.com/";
const CHECK_INTERVAL_MINUTES = 10;

let previousHash = null;

const checkPage = async () => {
  const response = await axios.get(WEB_PAGE_URL);
  const currentHash = crypto
    .createHash("sha256")
    .update(response.data)
    .digest("hex");

  if (currentHash !== previousHash) {
    sendNotification(`Web page content has changed!`);
    previousHash = currentHash;
  }
};

const sendNotification = (text) => {
  const payload = { text };
  const options = {
    hostname: "hooks.slack.com",
    port: 443,
    path: SLACK_WEBHOOK_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on("error", (error) => {
    console.error(`Error: ${error.message}`);
  });

  req.write(JSON.stringify(payload));
  req.end();
};

checkPage();
setInterval(checkPage, CHECK_INTERVAL_MINUTES * 60 * 1000);