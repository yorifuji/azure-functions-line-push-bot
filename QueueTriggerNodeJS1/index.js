
var line = require("./line.js");

module.exports = function (context, myQueueItem) {
    context.log('Node.js queue trigger function processed work item', myQueueItem);
    return line.push(myQueueItem);
};
