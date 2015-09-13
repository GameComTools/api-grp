exports.commandCallout = {
    name: "command/callout",
    description: "Callout command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
            var group = groups[0];

            if (!group.warData || Date.now() >= group.warData.warExpires) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'A war has not been started. Please contact your leader.'
                    }
                });
            } else if (Date.now() >= group.warData.calloutExpires) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'Callouts are closed for this war. To see the callotus use !warList'
                    }
                });
            } else if (!parseInt(params.args[0]) || parseInt(params.args[0]) > group.warData.calloutMax) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'Please callout with a number between 1 and ' + group.warData.calloutMax + ' (ex !callout 1)'
                    }
                });
            } else if(group.warData.callouts[parseInt(params.args[0])-1] && group.warData.callouts[parseInt(params.args[0])-1].user_id) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'That enemy has already been called. To see a list use !warList'
                    }
                });
            } else {
                var obj = {
                    $set: {

                    }
                };
                obj['$set']['warData.callouts.' + (parseInt(params.args[0])-1)] = {
                    name: params.name,
                    user_id: params.user_id
                };
                group.warData.callouts.forEach(function(item, index) {
                    if (item && item.user_id === params.user_id) {
                        obj['$set']['warData.callouts.' + index] = {};
                    }
                });
                console.log(obj);
                api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);

                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": params.name + ' has called ' + params.args[0]
                    }
                });
            }
            next();
        });
    }
};
