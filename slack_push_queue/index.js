
const slack = require("../Shared/slack.js");

module.exports = function (context, myQueueItem) {
    context.log('Node.js queue trigger function processed work item', myQueueItem);
    let p = myQueueItem.map(item => slack.push(process.env.SLACK_WEBHOOK_URL, item));
    return Promise.all(p);
};
