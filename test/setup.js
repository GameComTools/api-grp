var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionhero = new actionheroPrototype();
var Promise = require('bluebird');
var merge = require('deepmerge');
global.ItShould = require('should');
global.resetMongo = true;
global.lastParent = '';

beforeEach(function(done) {
    if (this.currentTest.parent.title !== global.lastParent) {
        global.resetMongo = true;
        global.lastParent = this.currentTest.parent.title;
    }

    // Reset enqueue as we override it during tests
    api.tasks.enqueue = function(task, params, queue, callback) {
        callback();
    };
    api.groupme = function(endpoint, method, data, all) {
        api.log('MOCK: SENT GROUPME MESSAGE', 'alert');
    };

    // Reset The Mock Mongo DB
    if (global.resetMongo) {
        global.mockDatabase = {
            communities: [
                {
                    "_id": "55f2009570dae75f9df5f5cc",
                    "name": "Kody Testing"
                }
            ],
            groupmeGroups: [
                {
                    "_id": "55f3389370dae75f9df5f5cd",
                    "groupId": "13800367",
                    "botEnabled": true,
                    "cooldowns": {
                        "55f33ca470dae75f9df5f5ce": 0
                    },
                    "customCooldowns": {
                        "55f33ca470dae75f9df5f5ce": 5
                    }
                }
            ],
            groupmeCommands: [
                {
                    "_id": "55f33ca470dae75f9df5f5ce",
                    "command": "ping",
                    "cooldown": 0
                }
            ]
        };
    }
    done();
});

before(function(done) {
    actionhero.start(function(err, a) {
        global.api = a;

        api.database.find = function(collection, query) {
            return new Promise(function(resolve, reject) {
                if (global.mockDatabase[collection]) {
                    var foundItems = [];
                    global.mockDatabase[collection].forEach(function(row) {
                        var found = true;
                        for (var i in query) {
                            if (row[i] !== query[i]) {
                                found = false;
                            }
                        }
                        if (found) {
                            foundItems.push(row);
                        }
                    });
                    return resolve(foundItems);
                }
                return resolve([]);
            });
        };

        api.database.updateOne = function(collection, query, updates) {
            return new Promise(function(resolve, reject) {
                if (global.mockDatabase[collection]) {
                    var col = global.mockDatabase[collection];
                    col.forEach(function(row, index) {
                        var found = true;
                        for (var i in query) {
                            if (row[i] !== query[i]) {
                                found = false;
                            }
                        }
                        if (found) {
                            if (updates['$set']) {
                                col[index] = merge(row, updates['$set']);
                            } else {
                                row = updates;
                            }
                        }
                    })
                } else {
                    if (updates['$set']) {
                        global.mockDatabase[collection] = updates['$set'];
                    } else {
                        global.mockDatabase[collection] = updates;
                    }
                }
                return resolve([]);
            });
        };
        done();
    })
});

after(function(done) {
    actionhero.stop(function() {
        done();
    });
});
