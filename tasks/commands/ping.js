exports.commandPing = {
    name: "command/ping",
    description: "Ping command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
                "text": 'pong'
            }
        });
        next();
    }
};
