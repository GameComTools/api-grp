var should = require('should');
var actionheroPrototype = require('actionhero').actionheroPrototype;
var actionhero = new actionheroPrototype();
var api;

describe('Action: status', function() {
    before(function(done) {
        actionhero.start(function(err, a) {
            api = a;
            done();
        })
    });

    after(function(done) {
        actionhero.stop(function() {
            done();
        });
    });

    it('calls status', function(done) {
        api.specHelper.runAction('status', function(response, connection) {
            done();
        });
    });
});
