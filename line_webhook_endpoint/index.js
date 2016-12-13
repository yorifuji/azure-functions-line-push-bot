
module.exports = function(context, req) {

    const line = require("./line.js");

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
}
