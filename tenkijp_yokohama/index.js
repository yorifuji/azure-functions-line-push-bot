
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
              "screen_name" : "tenkijp_yokoham",
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
    var tweet = tweets[0].text;
    var weather_emoji = "";
    try {
        tweet = tweet.replace(/[\d]+時発表 /,   "\n");
        tweet = tweet.replace("#tenkijp_横浜 ", "\n");
        var re =  /(横浜市の.+の天気) ([^ ]+) /;
        var weather = tweet.match(re)[2];
        if (weather) {
            weather.split("").forEach(c => {
                if      (c == "晴") weather_emoji += "\u2600"; // emoji: BLACK SUN WITH RAYS
                else if (c == "曇") weather_emoji += "\u2601"; // emoji: CLOUD
                else if (c == "雨") weather_emoji += "\u2614"; // emoji: UMBRELLA WITH RAIN DROPS
            });
        }
        tweet = tweet.replace(re, "$1 $2\n");
    } catch(e) {
    }
    return Promise.resolve({"type" : "text", "text" : weather_emoji + tweet});
}
