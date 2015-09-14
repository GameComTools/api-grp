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
        return global.getGroupMeMockData(endpoint, method);
    };

    // Reset The Mock Mongo DB
    if (global.resetMongo) {
        global.resetMongoFun();
    }
    done();
});

global.getGroupMeMockData = function(endpoint, method) {
    return new Promise(function(resolve, reject) {
        var fs = require('fs');
        var fPath = __dirname + '/../testMockData/' + method.toLowerCase() + '/' + endpoint.toLowerCase() + '.json';
        if (fs.existsSync(fPath)) {
            console.log(typeof require(fPath));
            return resolve(require(fPath));
        } else {
            api.log('No Mock Data For ' + endpoint + '(' + method + ')', 'alert');
            return resolve({});
        }
    });
};

global.resetMongoFun = function() {
    global.mockDatabase = {
        communities: [
            {
                "_id": "55f2009570dae75f9df5f5cc",
                "name": "Kody Testing",
                "groupMeTextTriggers": {
                    "awood is a homo" : {
                        "text" : "http://www.quickmeme.com/img/8a/8a8d32df11bd447ff64e8652dc10f093c9341fb87419ea4cdcd89ebdb8b2c947.jpg"
                    }
                }
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
                "command": "ping"
            }
        ]
    };
};

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
                                for (var i in updates['$set']) {
                                    if (i.indexOf('.') > -1) {
                                        function idxSet(obj,is, value) {
                                            if (typeof is == 'string')
                                                return idxSet(obj,is.split('.'), value);
                                            else if (is.length==1 && value!==undefined)
                                                return obj[is[0]] = value;
                                            else if (is.length==0)
                                                return obj;
                                            else
                                                return idxSet(obj[is[0]],is.slice(1), value);
                                        }

                                        idxSet(col[index], i, updates['$set'][i]);
                                        delete updates['$set'][i];
                                    }
                                }
                                col[index] = merge(col[index], updates['$set']);
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
