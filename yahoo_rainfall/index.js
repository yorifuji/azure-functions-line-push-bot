
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
    const yahoo = require("./yahoo_rainfall.js");

    const api_key = process.env.YAHOO_APP_ID;
    const lon = process.env.LONGITUDE;
    const lat = process.env.LATITUDE;

    yahoo.get_weather_data(api_key, lon, lat)
        .then(yahoo.get_rainfall_data)
        .then(yahoo.make_rainfall_message)
        .then(messages => {
            if (messages.length) {
                context.bindings.outputQueueItem = {
                    "to"       : process.env.LINE_PUSH_TO,
                    "messages" : messages
                };
                context.done();
            }
        })
        .catch(res => {
            context.log(res);
            context.done();
        })
}
