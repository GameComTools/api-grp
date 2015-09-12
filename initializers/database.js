module.exports = {
  loadPriority:  1000,
  startPriority: 1000,
  stopPriority:  1000,
  initialize: function(api, next){
    var Promise = require('bluebird');
    var ObjectId = require('mongodb').ObjectID;
    api.database = {
        find: function(collection, query) {
            return new Promise(function (resolve, reject) {
                if (query._id) {
                    query._id = ObjectId(query._id);
                }
                api.database.db
                    .collection(collection)
                    .find(query)
                    .toArray(function(err, docs) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(docs)
                    });
            });
        },
        updateOne: function(collection, query, update) {
            return new Promise(function (resolve, reject) {
                if (query._id) {
                    query._id = ObjectId(query._id);
                }
                api.database.db
                    .collection(collection)
                    .updateOne(query, update, function(err, docs) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(docs)
                    });
            });
        }
    };
    next();
  },
  start: function(api, next){
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(api.config.database.url, function(err, db) {
      if (err === null) {
        api.log('Connected To MongoDB', 'notice');
        api.database.db = db;
        next();
      } else {
        next(err);
      }
    });
  },
  stop: function(api, next){
    api.database.db.close();
    api.log('Disconnected From MongoDB', 'notice');
    next();
  }
};
