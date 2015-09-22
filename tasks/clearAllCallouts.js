exports.clearAllCallouts = {
    name: "clearAllCallouts",
    description: "Clear All Callouts Background Task",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        var obj = {
            $set: {
                'warData.callouts': []
            }
        };
        api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
                "text": 'All callouts have been cleared! You can now call any enemy.'
            }
        });
        next();
    }
};
