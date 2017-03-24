
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
              "count"       : 1
          };

    twitter.get_timeline(query)
        .then(format_message)
        .then(message => {
            context.bindings.outputQueueItem = {
                "to"       : process.env.LINE_PUSH_TO,
                "messages" : [ message ]
            };
            context.done();
        })
        .catch(res => {
            context.log(res);
            context.done();
        })
}

function format_message(tweets)
{
    let tweet = tweets[0].text;
    tweet = tweet.slice(0, tweet.search("\n"))
    return {
        "type" : "text",
        "text" : "\u{1F4FA}" + tweet
    }
}
