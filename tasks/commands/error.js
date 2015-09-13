exports.commandError = {
    name: "command/error",
    description: "Error handler",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        var errId = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for ( var i=0; i < 5; i++ ) {
            errId += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        var errorText = {
            def: 'Well this is embarrassing but I ran into an error. Please try again in a few moments. If this continues, please contact support.',
            giphy: 'Giphy seems to be experiencing an issue at this time. Please try again in a few moments.',
            notRegistered: 'This group is not configured properly. Please contact support.',
            cooldown: 'That command was just used. Try again in ' + params.timeRemaining,
            restricted: 'You are not allowed to access that command. Please contact your leader.'
        };
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
                "text": (errorText[params.errType || 'def'] || errorText.def) + ' (ERR-ID: ' + errId + ')'
            }
        });
        next();
    }
};
