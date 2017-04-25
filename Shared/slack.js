
/*
  slack library.
*/

function _push(webhook_url, json)
{
    const https = require("https");
    const url   = require("url").parse(webhook_url);

    return new Promise((resolve,reject) => {
	// An object of options to indicate where to post to
	const options = {
            host    : url.host,
            path    : url.path,
            method  : 'POST',
            headers : {
		'Content-Type': 'application/json'
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
        
        req.write(JSON.stringify(json));
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
    slack.push(process.env.SLACK_WEBHOOK_URL, { "text" : ":smile: hello"})
        .then(console.log)
        .catch(console.log)
}
