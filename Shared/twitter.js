
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

function _save_since_id(context, tweets)
{
    return new Promise(resolve => {
        if (tweets.length) {
            const screen_name = tweets[0].user.screen_name;
            const id_str = tweets[0].id_str;
            context.log(screen_name)
            context.log(id_str)
            for (var i = 0; i < context.bindings.inputDocument.length; i++) {
                if (context.bindings.inputDocument[i].id == screen_name) {
                    context.bindings.outputDocument[i].since_id = id_str;
                    break;
                }
            }
        }
        resolve(tweets)
    });
}

function _get_since_id(context, name)
{
    let since_id = null;
    context.bindings.inputDocument.forEach(db => {
        if (db.id == name) since_id = db.since_id;
    });
    return since_id;
}

/*
  exports
*/

var twitter = function() {
}
twitter.get_timeline = _get_timeline;
twitter.save_since_id = _save_since_id;
twitter.get_since_id = _get_since_id;
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
