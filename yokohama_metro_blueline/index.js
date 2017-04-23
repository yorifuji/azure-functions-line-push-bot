
module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if(myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
    return main(context);
};

if (require.main === module) {
    var context = {
        log : console.log,
        done: () => {
            console.log(context.bindings);
        },
        bindings : {
            inputDocument : [
                {
                    "id" : "yokohama_koutuu",
                    "since_id" : "855200443386929152"
                }
            ],
            outputDocument : [
            ]
        }
    };
    main(context);
}

function main(context)
{
    var twitter = require("../Shared/twitter.js");
    const query = 
          {
              "screen_name" : "yokohama_koutuu",
              "count"       : 5
          };

    const since_id = twitter.get_since_id(context, query.screen_name);
    if (since_id) query["since_id"] = since_id;
    context.log(query);

    context.bindings.outputDocument = context.bindings.inputDocument;

    return twitter.get_timeline(query)
        .then(tweets => {
            return twitter.save_since_id(context, tweets);
        })
        .then(filter_timeline)
        .then(tweets => {
            if (tweets.length) {
                context.bindings.outputQueueItem = {
                    "to"       : process.env.LINE_PUSH_TO,
                    "messages" : format_message(tweets)
                }
                context.bindings.outputSlackQueue = tweets.map(tweet => {
                    return {
                        "text" : tweet.text
                    }
                })
            }
        })
}

function filter_timeline(tweets)
{
    return tweets.reverse().filter(tweet => tweet.text.match(/【ブルーライン】運行情報/));
}

function format_message(tweets)
{
    return tweets.map(tweet => ({"type" : "text", "text" : "\u{1F683}\u{1F4A4}" + tweet.text}));
}
