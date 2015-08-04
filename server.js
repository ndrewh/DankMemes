var Twit = require("twit"),
request = require("request"),
nconf = require("nconf"),
twilio = require("twilio"),
colors = require("colors");

nconf.argv()
  .env()
  .file({ file: "config.json" });

var alreadySent = [];

var Twilio = twilio(nconf.get("twilio-account"), nconf.get("twilio-secret"));

var client = new Twit({
  consumer_key: nconf.get("twitter-consumer"),
  consumer_secret: nconf.get("twitter-consumerSecret"),
  access_token: nconf.get("twitter-access"),
  access_token_secret: nconf.get("twitter-accessSecret")
});

var stream = client.stream("user");

stream.on("user_event", function(event) {
  if (event.event == "favorite") {
    if (event.source.screen_name == nconf.get("twitter-receiver") && event.target.screen_name == nconf.get("twitter-sender")) {
      sendDankMeme();
    }
  }
});

function sendDankMeme() {
  console.log("Sending Andrew a dank meme...".america);
  getDankMeme(function(meme) {
    sendTwilioMessage(meme);
  });
}

function getDankMeme(callback) {
  request("http://www.reddit.com/r/dankmemes.json", function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      var posts = json.data.children;
      for (var i = 0; i < json.data.children.length; i++) {
        if (posts[i].data.domain !== "i.imgur.com") continue;
        var url = posts[i].data.url;
        if (alreadySent.indexOf(url) > -1) continue;
        alreadySent.push(url);
        callback(url);
        break;
      }
    }
  });
}

function sendTwilioMessage(picture) {
  Twilio.sendMessage({
    to: nconf.get("receiving-phone"),
    from: nconf.get("sending-phone"),
    NumMedia: 1,
    MediaUrl: picture
  }, function(err, responseData) {
    if (err !== null) {
      console.log("RED ALERT!  The Twilio message failed!".bold.red);
      console.log(err);
    } else {
      console.log("Sent a dank meme!".zebra); // thank you mr. skeletal
    }
  });
}

console.log(("Now listening for twitter favorites on account " + nconf.get("twitter-receiver") +
" from user " + nconf.get("twitter-sender")).green);
