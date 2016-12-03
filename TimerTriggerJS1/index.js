
var https = require("https");
var url = require("url");

module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if(myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
    main(context);
};

if (require.main === module) {
    var context = {
        log : console.log,
        done: () => {}
    };
    main(context);
}

function main(context)
{
    var twitter = require("./twitter.js");
    const query = 
          {
              "screen_name" : "yokohama_koutuu",
//              "count"       : 10
          };

    twitter.get_timeline(query)
        .then(filter_timeline)
        .then(format_message)
        .then(push_line)
        .then(res => {
            context.log(res);
            context.done();
        })
        .catch(res => {
            context.log(res);
            context.done();
        })
}

function filter_timeline(tweets)
{
    return Promise.resolve(
        tweets.
            filter(tweet => tweet.text.indexOf('【ブルーライン】運行情報') == 0).
            filter(tweet => (new Date() - new Date(tweet.created_at)) / 1000 <= 60 * 10)
    )
}

function format_message(tweets)
{
    return Promise.resolve(
        tweets.map(tweet => ({"type" : "text", "text" : tweet.text}))
    );
}

function push_line(messages)
{
    if (!messages.length) return Promise.resolve();

    return new Promise((resolve,reject) => {
        var post_data = JSON.stringify({
            "to" : process.env.LINE_PUSH_TO,
            "messages" : messages
        });
        
        var parse_url = url.parse("https://api.line.me/v2/bot/message/push");
        var post_options = {
            host: parse_url.host,
            path: parse_url.path,
            method: 'POST',
            headers: {
                'Content-Type'  : 'application/json',
                'Authorization' : 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN,
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        
        var post_req = https.request(post_options, res => {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body);
            })
            res.on('error', err => {
                reject(new Error(err));
            })
        });
        
        post_req.write(post_data);
        post_req.end();
    });
}

