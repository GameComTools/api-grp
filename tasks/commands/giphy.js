exports.commandGiphy = {
    name: "command/giphy",
    description: "Giphy command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        var giphy = require('giphy')(api.config.giphy.apiKey);
        giphy.random({
            tag: params.args[0]
        }, function(err, img) {
            if (err === null) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": img.data.image_url
                    }
                });
                next();
            } else {
                var updates = {cooldowns: {}};
                updates.cooldowns[params.db_command_id] = Date.now() + 30000;
                updates = {$set: updates};
                api.database.updateOne('groupmeGroups', {_id: params.db_group_id}, updates);

                params.module = 'task/command/giphy';
                params.err = err;
                params.errType = 'giphy';
                api.tasks.enqueue('command/error', params, 'default', function(err, toRun){
                    next(err);
                });
            }
        });
    }
};
