exports.sendMessage = {
    name: "sendMessage",
    description: "Send Message Background Task",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
                "text": params.message
            }
        });
        next();
    }
};
