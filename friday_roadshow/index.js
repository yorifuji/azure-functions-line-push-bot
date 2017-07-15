
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
            console.log(context.bindings.outputQueueItem);
        },
        bindings : {}
    };
    main(context);
}

function main(context)
{
    var twitter = require("../Shared/twitter.js");
    const query = 
          {
              "screen_name" : "eigaie_bot",
              "count"       : 10
          };

    twitter.get_timeline(query)
        .then(filter_timeline)
        .then(format_message)
        .then(message => {
            context.bindings.outputQueueItem = {
                "to"       : process.env.LINE_PUSH_TO,
                "messages" : message
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
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    return tweets.filter(tweet => new Date(tweet.created_at) >= today)
}

function format_message(tweets)
{
    return tweets.map( tweet => {
        return {
            "type" : "text",
            "text" : "\u{1F4FA}" + tweet.text
        }
    })
}
