exports.commandWar = {
    name: "command/war",
    description: "War command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
            var group = groups[0];

            if (!group.warData || Date.now() >= group.warData.warExpires) {
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
                            warExipres: null,
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
                            "text": 'War is imminent! Make your callouts now! (ex. !callout 2, for slot 2)'
                        }
                    });
                    api.database.updateOne('groupmeGroups', {groupId: params.group_id}, {
                        $set: {
                            'warData.calloutMax': parseInt(params.args[0]),
                            'warData.warExpires': Date.now() + ((60000 * 60) * 48),
                            'warData.calloutExpires': Date.now() + ((60000 * 60) * 24)
                        }
                    });
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
