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
                        "text": 'A war has not ben started. Please contact your leader.'
                    }
                });
            }
            next();
        });
    }
};
