
/*

  Twitter api library.

*/

function _get_timeline(query) {

    var https = require("https");
    var querystring = require('querystring');

    const url = "https://api.twitter.com/1.1/statuses/user_timeline.json?";
    
    return new Promise((resolve, reject) => {
        var req = https.request({
            host    : 'api.twitter.com',
            path    : '/1.1/statuses/user_timeline.json?' + querystring.stringify(query),
            method  : 'GET',
            headers : {'Authorization' : 'Bearer ' + process.env.TWITTER_APP_TOKEN },
        }, res => {
            var body = '';
            res.on('data', chunk => {
                body += chunk.toString();
            });
            res.on('end', () => {
                resolve(JSON.parse(body))
            });
            res.on('error', err => {
                reject(new Error(err));
            });
        });
        req.on('error', err => {
            reject(new Error(err));
        });
        req.end();
    });
}

/*
  exports
*/

var twitter = function() {
}
twitter.get_timeline = _get_timeline;
module.exports = twitter;

/*
  test code
*/

if (require.main === module) {

    var twitter = require("./twitter.js");
    const query = 
          {
              "screen_name" : "twitterapi",
              "count"       : 10
          };

    twitter.get_timeline(query)
        .then(tweets => {
            console.log(tweets.map(tweet => tweet.text))
            console.log(tweets.map(tweet => tweet.created_at))
        })
}
