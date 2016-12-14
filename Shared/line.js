
/*
  LINE API Library.
*/

function _push(message)
{
    var https = require("https");
    var url   = require("url");

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

function _validate_signature(signature, body)
{
    const crypto = require("crypto");
    return signature == crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

/*
  exports
*/

var line = function() {
}
line.push = _push;
line.validate_signature = _validate_signature;
module.exports = line;

/*
  test code
*/

if (require.main === module) {

    var line = require("./line.js");
    const message = 
          {
              "to"       : process.env.LINE_PUSH_TO,
              "messages" : [
		  {
		      "type" : "text",
		      "text" : "hello,line"
		  }
	      ]
          };

    line.push(message)
        .then(console.log)
        .catch(console.log)
}
