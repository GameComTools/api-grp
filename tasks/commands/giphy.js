exports.commandGiphy = {
    name: "command/giphy",
    description: "Giphy command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        var giphy = require('giphy')(api.config.giphy.apiKey);
        var query = params.args.join('+');
        giphy.search({
            q: query,
            limit: 0,
            offset: 0
        }, function(err, img) {
            if (err === null && img.data && img.pagination) {
                giphy.search({
                    q: query,
                    limit: 1,
                    offset: Math.floor(Math.random() * img.pagination.total_count)
                }, function(err, img) {
                    console.log(img);
                    if (err === null && img.data) {
                        if (img.data[0] && img.data[0].images && img.data[0].images.original && img.data[0].images.original.url) {
                            api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                                "message": {
                                    "text": img.data[0].images.original.url
                                }
                            });
                        } else {
                            var updates = {cooldowns: {}};
                            updates.cooldowns[params.db_command_id] = Date.now() + 30000;
                            updates = {$set: updates};
                            api.database.updateOne('groupmeGroups', {_id: params.db_group_id}, updates);

                            api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                                "message": {
                                    "text": "Giphy did not return any results :( - Please try another search term"
                                }
                            });
                        }
                        next();
                    } else {
                        handleError(err);
                    }
                });
            } else {
                handleError(err);
            }
        });

        function handleError(err) {
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
        //giphy.random({
        //    tag: params.args.join('+'),
        //    rating: 'pg-13'
        //}, function(err, img) {
        //    if (err === null && img.data) {
        //        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
        //            "message": {
        //                "text": img.data.image_url
        //            }
        //        });
        //        next();
        //    } else {
        //        var updates = {cooldowns: {}};
        //        updates.cooldowns[params.db_command_id] = Date.now() + 30000;
        //        updates = {$set: updates};
        //        api.database.updateOne('groupmeGroups', {_id: params.db_group_id}, updates);
        //
        //        params.module = 'task/command/giphy';
        //        params.err = err;
        //        params.errType = 'giphy';
        //        api.tasks.enqueue('command/error', params, 'default', function(err, toRun){
        //            next(err);
        //        });
        //    }
        //});
    }
};
