exports.commandCalloutClear = {
    name: "calloutClear",
    description: "Callout Clear Background Task",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
            params.idx = parseInt(params.idx);
            var message = 'Callout for enemy ' + params.idx+1 + ' has been cleared. It can now be called again.';
            var obj = {
                $set: {

                }
            };
            obj['$set']['warData.callouts.' + params.idx] = {
                user_id: false
            };
            api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);
            api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                "message": {
                    "text": message
                }
            });
            next();
        });
    }
};
