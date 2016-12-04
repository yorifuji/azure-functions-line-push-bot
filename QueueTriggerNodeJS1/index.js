
var https = require("https");
var url   = require("url");

function push_line(message)
{
    return new Promise((resolve,reject) => {
        var post_data = JSON.stringify(message);
        var parse_url = url.parse("https://api.line.me/v2/bot/message/push");
        var post_options = {
            host: parse_url.host,
            path: parse_url.path,
            method: 'POST',
            headers: {
                'Content-Type'  : 'application/json',
                'Authorization' : 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN,
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        
        var post_req = https.request(post_options, res => {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body);
            })
            res.on('error', err => {
                reject(new Error(err));
            })
        });
        
        post_req.write(post_data);
        post_req.end();
    });
}

module.exports = function (context, myQueueItem) {
    context.log('Node.js queue trigger function processed work item', myQueueItem);
    push_line(myQueueItem);
    context.done();
};
