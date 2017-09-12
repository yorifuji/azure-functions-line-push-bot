
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
    const yahoo = require("../Shared/yahoo_rainfall.js");

    const api_key = process.env.YAHOO_APP_ID;
    const lon = process.env.LONGITUDE;
    const lat = process.env.LATITUDE;

    yahoo.get_weather_data(api_key, lon, lat)
        .then(yahoo.get_rainfall_data)
        .then(data => {
            var o = data.filter(e => e["Type"] == "observation");
            var f = data.filter(e => e["Type"] == "forecast"   );
            let tbl_data = {
                "partitionKey"    : "rainfall",
                "rowKey"          : Date(),
                "date"            : o[o.length - 1]["Date"],
                "rainfall"        : o[o.length - 1]["Rainfall"],
                "rainfall_prev"   : o[o.length - 2]["Rainfall"],
                "forecast"        : f[0]["Rainfall"]
            }
            context.log(tbl_data);
            context.bindings.rainfall = tbl_data;
            return data;
        })
        .then(yahoo.make_rainfall_message)
        .then(messages => {
            const last_date = null;
            try {
                last_date = context.bindings.inputBlob["last_date"];
            } catch(e) {
            }
            if (last_date && (last_date + 1000 * 60 * 60 > new Date())) return [];
            else return messages;
        })
        .then(messages => {
            if (messages.length) {
                context.bindings.outputQueueItem = {
                    "to"       : process.env.LINE_PUSH_TO,
                    "messages" : messages
                };
                context.bindings.outputBlob = {
                    "last_date" : new Date()
                }
            }
            context.done();
        })
        .catch(res => {
            context.log(res);
            context.done();
        })
}
