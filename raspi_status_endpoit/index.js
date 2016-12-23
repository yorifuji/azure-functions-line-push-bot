
module.exports = function(context, req) {
    process_request(context, req.body);   
    context.res = { body : "" };
    context.done();
};

if (require.main === module) {
    var context = {
        log : console.log,
        done: () => {
            console.log(context.bindings.raspi);
        },
        bindings : {}
    };

    let body = {
        "partitionKey"    : "status",
        "rowKey"          : Date(),
        "cpu_temperature" : 41.1,
    }
    
    process_request(context, body);
}

function process_request(context, body)
{
    context.log(body);

    context.bindings.raspi = body;
    
    const slack = require("../Shared/slack.js");
    slack.push(process.env.SLACK_WEBHOOK_RASPI_URL, { "text" : JSON.stringify(body) })
        .then(console.log)
        .catch(console.log)
}
