describe('Task: clearAllCallouts', function() {

    before(function() {
        global.resetMongoFun();
        global.resetMongo = false;
        global.lastParent = this.test.parent.title;
    });

    it('should clearCallouts', function (done) {
        api.database.updateOne('groupmeGroups', {
            groupId: "13800367"
        }, {
            "$set": {
                'warData': {
                    opponent: 'Testing',
                    calloutMax: 2,
                    callouts: ['d', 't'],
                    warExipres: Date.now() + 60000,
                    calloutExpires: Date.now() - 100
                }
            }
        });

        api.specHelper.runTask('calloutClear', {
            group_id: "13800367",
            idx: 0
        }, function (response) {
            api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
                ItShould(group[0].warData.callouts[0].user_id).equal(false);
                done();
            });
        });
    });
});
