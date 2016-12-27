
module.exports = function(context, req) {

    const line = require("../Shared/line.js");

    if (line.validate_signature(req.headers['x-line-signature'], req.body)) {
        context.bindings.outputQueueItem = process_request(context, req.body);
    }
    else {
        context.log('fail to validate signature');
    }
    
    context.res = { body : "" };
    context.done();
};

function process_request(context, body)
{
    return body.events.filter(event => event.type == "message").map(msg => {
        return {
            "text" : msg.message.text
        };
    });
}
