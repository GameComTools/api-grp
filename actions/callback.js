exports.callback =  {
    name: "callback",
    description: "Provides a callback endpoint for GroupMe",
    outputExample: {
        success: true
    },
    inputs: {
        communityId: {
            required: true
        },
        group_id: {
            required: true
        },
        user_id: {
            required: true
        },
        name: {
            required: false
        },
        text: {
            required: true
        }
    },

    run: function(api, data, next) {
        data.response.success = true;

        if (data.params.text[0] === '!') {
            // This is a command
            var command = data.params.text.split(' ')[0].replace('!', '').toLowerCase();
            var err = 'command/notFound';
            data.params.cmdErr = 'NO_FOUND';
            for (var i in api.tasks.tasks) {
                if (i.split('/')[0] === 'command') {
                    var cname = i.split('/')[1];
                    if (command === cname) {
                        var promises = [
                            api.database.find('communities', {
                                _id: data.params.communityId
                            }),
                            api.database.find('groupmeGroups', {
                                groupId: data.params.group_id
                            }),
                            api.database.find('groupmeCommands', {
                                command: cname
                            })
                        ];
                        var Promise = require('bluebird');
                        return Promise.all(promises).spread(function(community, groupmeGroup, groupmeCommand) {
                            if (community[0]) {
                                if (groupmeGroup[0].botEnabled) {
                                    if (groupmeCommand[0]) {
                                        if (
                                            groupmeGroup[0].accessControl &&
                                            groupmeGroup[0].accessControl[groupmeCommand[0]._id] &&
                                            groupmeGroup[0].accessControl[groupmeCommand[0]._id].indexOf(data.params.user_id) === -1
                                        ) {
                                            data.params.errType = 'restricted';
                                        } else {
                                            if (
                                                !groupmeGroup[0].cooldowns || !groupmeGroup[0].cooldowns[groupmeCommand[0]._id] ||
                                                groupmeGroup[0].cooldowns[groupmeCommand[0]._id] <= Date.now()
                                            ) {
                                                data.params.db_command_id = groupmeCommand[0]._id;
                                                data.params.db_group_id = groupmeGroup[0]._id;
                                                data.params.args = data.params.text.split(' ');
                                                data.params.args.shift();
                                                var cooldown = groupmeCommand[0].cooldown;
                                                if (cooldown === undefined) {
                                                    cooldown = 15;
                                                }
                                                if (groupmeGroup[0].customCooldowns && groupmeGroup[0].customCooldowns[groupmeCommand[0]._id]) {
                                                    cooldown = groupmeGroup[0].customCooldowns[groupmeCommand[0]._id];
                                                }
                                                var updates = {$set: {}};
                                                updates['$set']['cooldowns.' + groupmeCommand[0]._id] = Date.now() + (cooldown * 60000);

                                                api.database.updateOne('groupmeGroups', {_id: groupmeGroup[0]._id}, updates);
                                                return api.tasks.enqueue(i, data.params, 'default', function (err, toRun) {
                                                    next(err);
                                                });
                                            } else {
                                                // This command is in cooldown mode
                                                data.params.errType = 'cooldown';
                                                var diffMs = (groupmeGroup[0].cooldowns[groupmeCommand[0]._id] - Date.now()); // milliseconds
                                                var diffMins = Math.round(diffMs / 1000 / 60); // minutes
                                                var diffSeconds = Math.round(diffMs / 1000); // seconds

                                                var timeRemaining = 'a few minutes!';
                                                if (diffSeconds < 60) {
                                                    timeRemaining = diffSeconds + ' second' + (diffSeconds > 1 ? 's' : '') + '!';
                                                } else {
                                                    timeRemaining = diffMins + ' minute' + (diffMins > 1 ? 's' : '') + '!';
                                                }
                                                data.params.timeRemaining = timeRemaining;
                                            }
                                        }
                                    } else {
                                        return api.tasks.enqueue(err, data.params, 'default', function(err, toRun){
                                            next(err);
                                        });
                                    }
                                }
                            } else {
                                data.params.errType = 'notRegistered';
                            }

                            api.tasks.enqueue('command/error', data.params, 'default', function(err, toRun){
                                next(err);
                            });
                        }, next);
                    }
                }
            }
            return api.tasks.enqueue(err, data.params, 'default', function(err, toRun){
                next(err);
            });
        } else {
            api.database.find('communities', {
                _id: data.params.communityId
            }).then(function(communities) {
                if (communities[0] && communities[0].groupMeTextTriggers) {
                    for (var i in communities[0].groupMeTextTriggers) {
                        if (data.params.text.toLowerCase().indexOf(i) > -1) {
                            if (
                                !communities[0].groupMeTextTriggers[i].cooldown ||
                                communities[0].groupMeTextTriggers[i].cooldown <= Date.now()
                            ) {
                                var obj = {
                                    "message": {
                                        "text": "☃"
                                    }
                                };
                                var cooldown = communities[0].groupMeTextTriggers[i].customCooldown;
                                if (cooldown === undefined) {
                                    cooldown = 5;
                                }
                                if (communities[0].groupMeTextTriggers[i].text) {
                                    obj.message.text = communities[0].groupMeTextTriggers[i].text
                                } else {
                                    delete communities[0].groupMeTextTriggers[i].cooldown;
                                    delete communities[0].groupMeTextTriggers[i].customCooldown;
                                    obj.message.attachments = [
                                        communities[0].groupMeTextTriggers[i]
                                    ];
                                }
                                var updates = {$set: {}};
                                updates['$set']['groupMeTextTriggers.' + i + '.cooldown'] = Date.now() + (cooldown * 60000);
                                api.database.updateOne('communities', {_id: communities[0]._id}, updates);

                                api.groupme('groups/' + data.params.group_id + '/messages', 'POST', obj);
                                return next();
                            }
                        }
                    }
                }
            });
            next();
        }
    }
};
