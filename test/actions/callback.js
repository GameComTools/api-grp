var should = require('should');
var Promise = require('bluebird');
var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionhero = new actionheroPrototype();
var api, firstNumber;

var mockDatabase = {
    communities: {
        "_id" : "55f2009570dae75f9df5f5cc",
        "name" : "Kody Testing"
    },
    groupmeGroups: {
        "_id" : "55f3389370dae75f9df5f5cd",
        "groupId" : "13800367",
        "botEnabled" : true,
        "cooldowns" : {
            "55f33ca470dae75f9df5f5ce" : 0
        },
        "customCooldowns" : {
            "55f33ca470dae75f9df5f5ce" : 5
        }
    },
    groupmeCommands: {
        "_id" : "55f33ca470dae75f9df5f5ce",
        "command" : "ping",
        "cooldown" : 0
    }
};

describe('Action: callback', function() {
    before(function(done) {
        actionhero.start(function(err, a) {
            api = a;

            api.database.find = function(collection, query) {
                return new Promise(function(resolve, reject) {
                    if (mockDatabase[collection]) {
                        return resolve([mockDatabase[collection]]);
                    }
                    return resolve([]);
                });
            };
            api.groupme = function(endpoint, method, data, all) {
                console.log('MOCK: SENT GROUPME MESSAGE');
            };
            done();
        })
    });

    after(function(done) {
        actionhero.stop(function() {
            done();
        });
    });

    it('does nothing if text is not command', function(done) {
        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: 'Hello World!'
        }, function(response, connection) {
            should(connection.params.db_command_id).be.undefined;
            done();
        });
    });

    it('starts task to run ping command', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/ping");
            callback();
        };


        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            should(connection.params.db_command_id).equal("55f33ca470dae75f9df5f5ce");
            done();
        });
    });

    it('cooldown time is correct - 1 minute', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/error");
            should(params.errType).equal("cooldown");
            should(params.timeRemaining).equal("1 minute!");
            callback();
        };
        mockDatabase.groupmeGroups.cooldowns['55f33ca470dae75f9df5f5ce'] = Date.now() + 60000;

        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });

    it('cooldown time is correct - 30 seconds', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/error");
            should(params.errType).equal("cooldown");
            should(params.timeRemaining).equal("30 seconds!");
            callback();
        };
        mockDatabase.groupmeGroups.cooldowns['55f33ca470dae75f9df5f5ce'] = Date.now() + 30000;

        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });

    it('should error with notRegistered for invalid communityId', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/error");
            should(params.errType).equal("notRegistered");
            callback();
        };
        mockDatabase.communities_bu = mockDatabase.communities;
        delete mockDatabase.communities;

        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            mockDatabase.communities = mockDatabase.communities_bu;
            delete mockDatabase.communities_bu;
            done();
        });
    });

    it('should error with unknownCommand for invalid command', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/notFound");
            callback();
        };
        mockDatabase.communities_bu = mockDatabase.communities;
        delete mockDatabase.communities;

        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!invalidCommand'
        }, function(response, connection) {
            mockDatabase.communities = mockDatabase.communities_bu;
            delete mockDatabase.communities_bu;
            done();
        });
    });

    it('should error with unknownCommand for command not in DB', function(done) {
        api.tasks.enqueue = function(task, params, queue, callback) {
            should(task).equal("command/notFound");
            callback();
        };
        mockDatabase.groupmeCommands_bu = mockDatabase.groupmeCommands;
        delete mockDatabase.groupmeCommands;

        api.specHelper.runAction('callback', {
            communityId: 56316,
            group_id: 12345,
            user_id: 12345,
            text: '!ping'
        }, function(response, connection) {
            done();
        });
    });
});
