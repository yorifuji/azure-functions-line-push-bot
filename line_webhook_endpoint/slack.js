
/*
  slack library.
*/

function _push(webhook_url, payload)
{
    const https = require("https");
    const url   = require("url").parse(webhook_url);

    const data = "payload=" + JSON.stringify(payload);
    
    return new Promise((resolve,reject) => {
	// An object of options to indicate where to post to
	const options = {
            host    : url.host,
            path    : url.path,
            method  : 'POST',
            headers : {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': Buffer.byteLength(data)
            }
	};
    
        var req = https.request(options, res => {
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

	req.on('error', e => {
            reject(new Error(e));
	});
        
        req.write(data);
        req.end();
    });
}

/*
  exports
*/

var slack = function() {
}
slack.push = _push;
module.exports = slack;

/*
  test code
*/

if (require.main === module) {

    const slack = require("./slack.js");
    slack.push(process.env.SLACK_WEBHOOK_URL, { "text" : "hello"})
        .then(console.log)
        .catch(console.log)
}
