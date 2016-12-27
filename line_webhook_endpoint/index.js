
module.exports = function(context, req) {

    const line = require("../Shared/line.js");

    if (line.validate_signature(req.headers['x-line-signature'], req.body)) {
        process_request(context, req.body);
    }
    else {
        context.log('fail to validate signature');
    }

    context.res = { body : "" };
    context.done();
};

function process_request(context, body)
{
    body.events.forEach(event => {
        if ((event.type == "follow" || event.type == "unfollow") && event.source.type == "user") {
            let record = {
                "partitionKey" : event.type,
                "rowKey"       : event.timestamp,
                "userId"       : event.source.userId
            }
            context.bindings.outputTable = record;
        }
        else if (event.type == "message" && event.message.type == "text") {
            context.bindings.outputQueueItem = {"text" : event.message.text };
        };
    });
}
