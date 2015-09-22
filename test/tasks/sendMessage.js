describe('Task: sendMessage', function() {
    it('responds', function (done) {
        api.groupme = function(endpoint, method, data, all) {
            ItShould(data.message.text).equal("Test");
            done();
        };

        api.specHelper.runTask('sendMessage', {
            group_id: "13800367",
            message: "Test"
        }, function (response) {

        });
    });
});
