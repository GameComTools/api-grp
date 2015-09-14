module.exports = {
    loadPriority:  1000,
    startPriority: 1000,
    stopPriority:  1000,
    initialize: function(api, next){
        var Promise = require('bluebird');
        var request = require('request');
        api.guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        api.groupme = function(endpoint, method, data, all) {
            return new Promise(function(resolve, reject) {
                if (data && data.message) {
                    data.message.source_guid = api.guid();
                }

                var options = {
                    uri: 'https://api.groupme.com/v3/' + endpoint,
                    method: method,
                    qs: {
                        token: api.config.groupme.token
                    },
                    headers: {
                        'X-Access-Token': api.config.groupme.token
                    },
                    json: data || {}
                };
                var query = ['token=' + api.config.groupme.token];
                if (method === 'GET') {
                    for (var i in options.json) {
                        query.push(i + '=' + options.json[i]);
                    }
                    options.json = true;
                }
                if (options.uri.indexOf('?') === -1) {
                    options.uri += '?';
                } else {
                    options.uri += '&';
                }
                options.uri += query.join('&');
                var getNextPage = function (resp, def, response) {
                    if (resp === undefined) {
                        return def({
                            response: response
                        });
                    }
                    data.page++;
                    if (resp.response !== null && resp.response !== undefined && resp.response.length > 0) {
                        response = response.concat(resp.response);
                        global.groupme(endpoint, method, data).then(function (resp) {
                            getNextPage(resp, def, response);
                        });
                    } else {
                        def({
                            response: response
                        });
                    }
                };
                var timeout = 0;
                if (options.uri.indexOf('messages') > -1) {
                    timeout = 1200;
                }
                setTimeout(function() {
                    request(options, function (error, response, body) {
                        if (all) {
                            data.page = 1;
                            getNextPage(body, resolve, []);
                        } else {
                            resolve(body);
                        }
                    });
                }, timeout);
            });
        };
        next();
    },
    start: function(api, next){
        next();
    },
    stop: function(api, next){
        next();
    }
};
