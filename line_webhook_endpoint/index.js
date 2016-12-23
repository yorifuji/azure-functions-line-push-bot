
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
    context.log(body);

/*
    body.events.filter(event => event.type == "message").forEach(event => {
        context.log(event.source);
        context.log(event.message);
    });
*/
    const slack = require("../Shared/slack.js");
    slack.push(process.env.SLACK_WEBHOOK_URL, { "text" : body.events[0].message.text})
        .then(console.log)
        .catch(console.log)
}
