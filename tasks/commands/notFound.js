exports.commandNotFound = {
    name: "command/notFound",
    description: "Command Not Found",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
                "text": 'Unknown Command (' + params.cmdErr + ')'
            }
        });
        next();
    }
};
