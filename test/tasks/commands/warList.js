describe('Task: warList', function() {

    before(function() {
        global.resetMongoFun();
        global.resetMongo = false;
        global.lastParent = this.test.parent.title;
        global.mockDatabase.groupmeCommands.command = 'warlist';
    });

    it('should respond when no war is occurring', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('A war has not been started');
            done();
        };

        api.specHelper.runTask('command/warlist', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!warList',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });

    it('should respond with expected test when war is active and callouts are active', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData': {
                    opponent: 'Testing',
                    calloutMax: 1,
                    callouts: [],
                    warExipres: Date.now() + 60000,
                    calloutExpires: Date.now() + 30000
                }
            }
        });

        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).startWith('Here are the callouts for the current war:\n\n    Enemy 1: \n\n');
            ItShould(data.message.text).containEql('left to call an enemy.');
            ItShould(data.message.text).containEql('left in war.');
            done();
        };

        api.specHelper.runTask('command/warlist', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!warList',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });

    it('should respond with expected test when war is active and callouts are NOT active', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData.calloutExpires': Date.now() - 30000,
                'warData.warExipres': Date.now() + 60000
            }
        });

        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).containEql('You can no longer call an enemy.');
            done();
        };

        api.specHelper.runTask('command/warlist', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!warList',
            action: 'callback',
            apiVersion: 1,
            cmdErr: 'NO_FOUND',
            db_command_id:  '55f33ca470dae75f9df5f5ce',
            db_group_id: '55f3389370dae75f9df5f5cd',
            args: []
        }, function (response) {

        });
    });
});
