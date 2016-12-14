
module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if(myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);   
    main(context);
};

if (require.main === module) {
    var context = {
        log : console.log,
        done: () => {
            console.log(context.bindings.outputQueueItem);
        },
        bindings : {}
    };
    main(context);
}

function main(context)
{
    const nhk = require("./nhk_api.js");
    let query = {
        "area"    : "140",
        "service" : "s3",
        "genre"   : "0600",
        "date"    : nhk.today_str()
    };
    
    nhk.get_program_genre(query)
        .then(format_message)
        .then(messages => {
            if (messages.length) {
                context.bindings.outputQueueItem = {
                    "to"       : process.env.LINE_PUSH_TO,
                    "messages" : messages
                };
            }
            context.done();
        })
        .catch(res => {
            context.log(res);
            context.done();
        })
}

function format_message(programs)
{
    if (!programs || !programs.list || !programs.list.s3) return [];

    return programs.list.s3.map(program => {
        let start  = new Date(program.start_time);
        start.setTime(start.getTime() + 1000 * 60 * 60 * 9); // UTC --> JST
        let hour      = start.getHours();
        let minute    = start.getMinutes();
        let title     = program.title;
        let subtitle  = program.subtitle;
        let content   = program.content;
        const web_url = "https://goo.gl/gGyNBG";
        return {
            "type" : "text",
            "text" : `\u{1F4FA}${title} ${hour}時${minute}分〜\n（概要）${subtitle}\n（あらすじ）${content}\n${web_url}`
        }
    });
}
