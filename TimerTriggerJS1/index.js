
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
        .then(messages => {
            context.bindings.outputQueueItem = {
                "to"       : process.env.LINE_PUSH_TO,
                "messages" : messages
            };
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
