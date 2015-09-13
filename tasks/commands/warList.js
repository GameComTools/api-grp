exports.commandWarList = {
    name: "command/warlist",
    description: "WarList command",
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
            } else {
                var message = 'Here are the callouts for the current war:\n\n';
                var c = 0;
                while (c < group.warData.calloutMax) {
                    message += '    Enemy ' + (c+1) + ': ' + (group.warData.callouts[c] ? group.warData.callouts[c].name || '' : '') + '\n';
                    c++;
                }
                message += '\n';
                var msec = (group.warData.calloutExpires - Date.now());
                if (msec > 0) {
                    var hours = Math.floor(msec / 1000 / 60 / 60);
                    msec -= hours * 1000 * 60 * 60;
                    var minutes = Math.floor(msec / 1000 / 60);
                    msec -= minutes * 1000 * 60;
                    var seconds = Math.floor(msec / 1000);
                    msec -= seconds * 1000;

                    if (hours > 0) {
                        message += hours + ' hour' + (hours > 1 ? 's' : '') + ' left to call an enemy. ';
                    } else if (minutes > 0) {
                        message += minutes + ' minute' + (minutes > 1 ? 's' : '') + ' left to call an enemy. ';
                    } else if (seconds > 0) {
                        message += seconds + ' second' + (seconds > 1 ? 's' : '') + ' left to call an enemy. ';
                    }
                } else {
                    message += 'You can no longer call an enemy. '
                }

                msec = (group.warData.warExipres - Date.now());

                hours = Math.floor(msec / 1000 / 60 / 60);
                msec -= hours * 1000 * 60 * 60;
                minutes = Math.floor(msec / 1000 / 60);
                msec -= minutes * 1000 * 60;
                seconds = Math.floor(msec / 1000);
                msec -= seconds * 1000;

                if (hours > 0) {
                    message += hours + ' hour' + (hours > 1 ? 's' : '') + ' left in war.';
                } else if (minutes > 0) {
                    message += minutes + ' minute' + (minutes > 1 ? 's' : '') + ' left in war.';
                } else {
                    message += seconds + ' second' + (seconds > 1 ? 's' : '') + ' left in war.';
                }

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
