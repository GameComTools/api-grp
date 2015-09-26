exports.commandWar = {
    name: "command/war",
    description: "War command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
            var group = groups[0];

            if (!group.warData || Date.now() >= group.warData.warExipres) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'Who will this war be against? (Respond !war {opponentName})'
                    }
                });
                api.database.updateOne('groupmeGroups', {groupId: params.group_id}, {
                    $set: {
                        warData: {
                            opponent: '',
                            calloutMax: 0,
                            callouts: [],
                            warExipres: Date.now() + 60000,
                            calloutExpires: null
                        }
                    }
                });
            } else if (group.warData.opponent === '') {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'Great! How many callouts should we allow? (Respond !war {maxCalloutCount})'
                    }
                });
                api.database.updateOne('groupmeGroups', {groupId: params.group_id}, {
                    $set: {
                        'warData.opponent': params.args.join(' ')
                    }
                });
            } else if (group.warData.calloutMax === 0) {
                if (parseInt(params.args[0])) {
                    api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                        "message": {
                            "text": 'Got it! Do you want callouts to clear 3 hours after they are made when 20 or less hours are left in war? (Respond !war {yes/no})'
                        }
                    });
                    api.database.updateOne('groupmeGroups', {groupId: params.group_id}, {
                        $set: {
                            'warData.calloutMax': parseInt(params.args[0])
                        }
                    });
                } else {
                    api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                        "message": {
                            "text": 'That does not look like a number, try again!'
                        }
                    });
                }
            } else if (group.warData.threeHourExpirations === undefined) {
                if (params.args[0].toLowerCase() === 'yes' || params.args[0].toLowerCase() === 'no') {
                    var answer = false;
                    if (params.args[0].toLowerCase() === 'yes') {
                        answer = true;
                    }
                    api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                        "message": {
                            "text": 'War is imminent! Make your callouts now! (ex. !callout 2, for slot 2)'
                        }
                    });
                    var message = 'War has begun!';
                    if (answer) {
                        message += ' In 4 hours callouts will be cleared and available to be called again. Calls made after this time will expire after 3 hours from when they were made and will be available to be called again.';
                        // Callouts clear 20 hour mark
                        api.tasks.enqueueAt(Date.now() + ((60000 * 60) * 28), "clearAllCallouts", {group_id: params.group_id}, 'default', function (err, toRun) {});
                    }
                    // War actually begins 24 hour mark
                    api.tasks.enqueueAt(Date.now() + ((60000 * 60) * 24), "sendMessage", {
                        group_id: params.group_id,
                        message: message + ' Good luck!'
                    }, 'default', function(err, toRun){});
                    var obj = {
                        $set: {
                            'warData.threeHourExpirations': answer,
                            'warData.warExipres': Date.now() + ((60000 * 60) * 48),
                            'warData.calloutExpires': Date.now() + ((60000 * 60) * 24)
                        }
                    };
                    api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);
                } else {
                    api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                        "message": {
                            "text": 'That does not look like a number, try again!'
                        }
                    });
                }
            } else {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'A war has already been started. To see the callouts use !warList'
                    }
                });
            }
            next();
        });
    }
};
