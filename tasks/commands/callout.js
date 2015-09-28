exports.commandCallout = {
    name: "command/callout",
    description: "Callout command",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
            var group = groups[0];

            if (!group.warData || Date.now() >= group.warData.warExipres) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'A war has not been started. Please contact your leader.'
                    }
                });
            } else if (Date.now() >= group.warData.calloutExpires && !group.warData.threeHourExpirations) {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": 'Callouts are closed for this war. To see the callouts use !warList'
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
                var message = params.name + ' has called ' + params.args[0];
                var timeLeft = group.warData.warExipres - Date.now();
                if (group.warData.threeHourExpirations && timeLeft <= 72000000) {
                    // Run in 3 hours
                    api.tasks.enqueueAt(Date.now() + 10800000, "calloutClear", {group_id: params.group_id, idx: (parseInt(params.args[0])-1)}, 'default', function(err, toRun){});
                    var moment = require('moment');
                    var expires = moment().add(3, 'hours').format('h:mm A');
                    message += ' (Expires At: ' + expires + ' EST)';
                    obj['$set']['warData.callouts.' + (parseInt(params.args[0])-1)].expires = expires;
                }
                group.warData.callouts.forEach(function(item, index) {
                    if (item && item.user_id === params.user_id) {
                        obj['$set']['warData.callouts.' + index] = {};
                    }
                });
                api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);

                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    "message": {
                        "text": message
                    }
                });
            }
            next();
        });
    }
};
