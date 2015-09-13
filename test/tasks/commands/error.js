describe('Task: error', function() {
    it('responds', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            done();
        };

        api.specHelper.runTask('command/error', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!invalid',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id: '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });
});
