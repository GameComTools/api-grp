describe('Action: status', function() {
    it('calls status', function(done) {
        api.specHelper.runAction('status', function(response, connection) {
            done();
        });
    });
});
