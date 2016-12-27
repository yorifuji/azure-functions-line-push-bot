
const slack = require("../Shared/slack.js");

module.exports = function (context, myQueueItem) {
    context.log('Node.js queue trigger function processed work item', myQueueItem);
    return slack.push(process.env.SLACK_WEBHOOK_URL, myQueueItem);
};
