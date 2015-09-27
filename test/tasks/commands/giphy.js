describe('Task: giphy', function() {
    it('responds', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            done();
        };

        api.specHelper.runTask('command/giphy', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!giphy',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id: '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['test']
        }, function (response) {

        });
    });

    it('errors and handles cooldown properly', function (done) {
        api.config.giphy.apiKey = 'SUPER INVALID';

        api.specHelper.runTask('command/giphy', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!giphy',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id: '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].cooldowns['55f33ca470dae75f9df5f5ce']).approximately(Date.now() + 30000, 5);
                done();
            });
        });
    });
});
