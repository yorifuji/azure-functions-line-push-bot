
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
              "count"       : 10
          };

    const since_id = twitter.get_since_id(context, query.screen_name);
    if (since_id) query["since_id"] = since_id;
    context.log(query);

    context.bindings.outputDocument = context.bindings.inputDocument;

    twitter.get_timeline(query)
        .then(tweets => {
            return twitter.save_since_id(context, tweets);
        })
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
            context.done();
        })
}

function filter_timeline(tweets)
{
    tweets = tweets.reverse()
        .filter(tweet => tweet.text.indexOf('【ブルーライン】運行情報') == 0)
        .filter(tweet => (new Date() - new Date(tweet.created_at)) / 1000 <= 60 * 10);
    return tweets.length ? Promise.resolve(tweets) : Promise.reject("no delay");
}

function format_message(tweets)
{
    return tweets.map(tweet => ({"type" : "text", "text" : "\u{1F683}\u{1F4A4}" + tweet.text}));
}
