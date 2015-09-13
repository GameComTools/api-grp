describe('Task: callout', function() {

    before(function() {
        global.resetMongo = false;
        global.lastParent = this.test.parent.title;
        global.mockDatabase.groupmeCommands.command = 'callout';
    });

    it('should respond when no war is occurring', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('A war has not been started');
            done();
        };

        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!callout',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });

    it('should respond when war is open but callouts are closed', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData': {
                    opponent: 'Testing',
                    calloutMax: 2,
                    callouts: [],
                    warExipres: Date.now() + 60000,
                    calloutExpires: Date.now() - 100
                }
            }
        });

        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('Callouts are closed for this war');
            done();
        };

        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!callout',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });

    it('should respond with error when calling a slot that is not parseable', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData.calloutExpires': Date.now() + 60000
            }
        });

        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('Please callout with a number between 1');
            done();
        };

        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!callout',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });

    it('should respond with error when calling a slot that is outside the max', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('Please callout with a number between 1');
            done();
        };

        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!callout 3',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['3']
        }, function (response) {

        });
    });

    it('should store my callout when calling an empty slot', function (done) {
        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: '12345',
            name: 'TestUser',
            text: '!callout 1',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['1']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.callouts[0]).deepEqual({
                    name: 'TestUser',
                    user_id: '12345'
                });
                done();
            });
        });
    });

    it('should change my callout when calling an empty slot and I have already called', function (done) {
        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: '12345',
            name: 'TestUser',
            text: '!callout 2',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['2']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.callouts[0]).deepEqual({});
                ItShould(group[0].warData.callouts[1]).deepEqual({
                    name: 'TestUser',
                    user_id: '12345'
                });
                done();
            });
        });
    });

    it('should error when calling a slot that is already called', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('That enemy has already been called');
        };

        api.specHelper.runTask('command/callout', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: '123456',
            name: 'TestUser2',
            text: '!callout 2',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: ['2']
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.callouts[1]).deepEqual({
                    name: 'TestUser',
                    user_id: '12345'
                });
                done();
            });
        });
    });
});
