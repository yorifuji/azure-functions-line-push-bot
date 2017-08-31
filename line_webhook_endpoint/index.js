
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
            if (event.message.text == "京急 のぼり") {
                get_next_train(context, true, event.source.userId);
            }
            else if (event.message.text == "京急 くだり") {
                get_next_train(context, false, event.source.userId);
            }
            else {
                context.bindings.outputQueueItem = {"text" : event.message.text };
            }
        };
    });
}

function get_next_train(context, is_up, uid)
{
    const line = require("../Shared/line.js");
    const text = get_train(is_up, 10); 
    const message = 
          {
              "to"       : uid,
              "messages" : [
                  {
                      "type" : "text",
                      "text" : text
                  }
              ]
          };
    
    line.push(message)
        .then(context.log)
        .catch(context.log)
}

function get_train(is_up, num) {
    
    const keikyu_timeline = require("../Shared/keikyu_timeline.js");
    
    const date = new Date()
    const base = date.getHours() * 100 + date.getMinutes()
    
    timeline = is_up ? keikyu_timeline.up : keikyu_timeline.down
    let trains = []
    timeline.forEach(tl => {
        if (parseInt(tl.time) >= base && trains.length < num) trains.push(tl)
    })
    
    let text = "";
    trains.forEach(tr => {
        text += `+${tr.time - base} 分後(${tr.time}) ${tr.type} ${tr.goto}行き\n`
    })
    return text;
}

    
