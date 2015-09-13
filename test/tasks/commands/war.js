describe('Task: war', function() {

    before(function() {
        global.resetMongoFun();
        global.resetMongo = false;
        global.lastParent = this.test.parent.title;
        global.mockDatabase.groupmeCommands.command = 'war';
    });

    it('starts the war questions if there is not one active', function (done) {
        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData).containEql({
                    opponent: '',
                    calloutMax: 0,
                    callouts: [],
                    calloutExpires: null
                });
                done();
            });
        });
    });

    it('stores the opponents name', function (done) {
        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war Testing 123',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['Testing', '123']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.opponent).equal('Testing 123');
                done();
            });
        });
    });

    it('does not store an invalid number', function (done) {
        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war abc',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['abc']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.calloutMax).equal(0);
                done();
            });
        });
    });

    it('stores the max callout count and has correct expiries', function (done) {
        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war 12',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['12']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.calloutMax).equal(12);
                ItShould(group[0].warData.warExipres).approximately(Date.now() + ((60000 * 60) * 48), 5);
                ItShould(group[0].warData.calloutExpires).approximately(Date.now() + ((60000 * 60) * 24), 5);
                done();
            });
        });
    });

    it('does not start another war when one is active', function (done) {
        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war 12',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['12']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.opponent).equal('Testing 123');
                done();
            });
        });
    });

    it('starts another war when the last one expired', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData.warExipres': Date.now() - 100
            }
        });

        api.specHelper.runTask('command/war', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!war 12',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['12']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.opponent).equal('');
                done();
            });
        });
    });
});
