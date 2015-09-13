describe('Action: callback', function() {
    it('does nothing if text is not command', function(done) {
        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: 'Hello World!'
        }, function(response, connection) {
            ItShould(connection.params.db_command_id).be.undefined;
            done();
        });
    });

    it('starts task to run ping command', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/ping");
            callback();
        };

        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            ItShould(connection.params.db_command_id).equal("55f33ca470dae75f9df5f5ce");
            done();
        });
    });

    it('cooldown time is correct - 1 minute', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/error");
            ItShould(params.errType).equal("cooldown");
            ItShould(params.timeRemaining).equal("1 minute!");
            callback();
        };
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'cooldowns.55f33ca470dae75f9df5f5ce': Date.now() + 60000
            }
        });

        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });

    it('cooldown time is correct - 30 seconds', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/error");
            ItShould(params.errType).equal("cooldown");
            ItShould(params.timeRemaining).equal("30 seconds!");
            callback();
        };
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'cooldowns.55f33ca470dae75f9df5f5ce': Date.now() + 30000
            }
        });

        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });

    it('ItShould error with notRegistered for invalid communityId', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/error");
            ItShould(params.errType).equal("notRegistered");
            callback();
        };

        api.specHelper.runAction('callback', {
            communityId: "INVALID",
            group_id: "13800367",
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });

    it('ItShould error with unknownCommand for invalid command', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/notFound");
            callback();
        };

        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!invalidCommand'
        }, function(response, connection) {
            done();
        });
    });

    it('ItShould error with unknownCommand for command not in DB', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            ItShould(task).equal("command/notFound");
            callback();
        };

        api.specHelper.runAction('callback', {
            communityId: "55f2009570dae75f9df5f5cc",
            group_id: "13800367",
            user_id: 12345,
            text: '!giphy'
        }, function(response, connection) {
            done();
        });
    });
});
