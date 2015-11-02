describe('Task: attacked', function() {

  before(function () {
    global.resetMongoFun();
    global.resetMongo = false;
    global.lastParent = this.test.parent.title;
    global.mockDatabase.groupmeCommands.command = 'attacked';
  });

  it('should respond when no war is occurring', function (done) {
    api.groupme = function (endpoint, method, data, all) {
      ItShould(data.message.text).startWith('A war has not been started');
      done();
    };

    api.specHelper.runTask('command/attacked', {
      communityId: "55f2009570dae75f9df5f5cc",
      group_id: "13800367",
      user_id: 12345,
      text: '!attacked',
      action: 'callback',
      apiVersion: 1,
      cmdErr: 'NO_FOUND',
      db_command_id: '55f33ca470dae75f9df5f5ce',
      db_group_id: '55f3389370dae75f9df5f5cd',
      args: []
    }, function (response) {

    });
  });

  it('should respond when no callout has been made', function (done) {
    api.groupme = function (endpoint, method, data, all) {
      ItShould(data.message.text).startWith('You currently have no enemy called');
      done();
    };

    api.database.updateOne('groupmeGroups', {
      groupId: "13800367"
    }, {
      "$set": {
        'warData': {
          opponent: 'Testing',
          calloutMax: 2,
          callouts: [],
          warExipres: Date.now() + 60000,
          calloutExpires: Date.now() - 100
        }
      }
    });

    api.specHelper.runTask('command/attacked', {
      communityId: "55f2009570dae75f9df5f5cc",
      group_id: "13800367",
      user_id: 12345,
      text: '!attacked',
      action: 'callback',
      apiVersion: 1,
      cmdErr: 'NO_FOUND',
      db_command_id: '55f33ca470dae75f9df5f5ce',
      db_group_id: '55f3389370dae75f9df5f5cd',
      args: []
    }, function (response) {

    });
  });

  it('should clear callout', function (done) {
    api.groupme = function (endpoint, method, data, all) {
      ItShould(data.message.text).startWith('Enemy 1 has been attacked');
      api.database.find('groupmeGroups', {groupId: '13800367'}).then(function(group) {
        ItShould(group[0].warData.callouts[0]).deepEqual({
          user_id: false
        });
      });
      done();
    };

    api.database.updateOne('groupmeGroups', {
      groupId: "13800367"
    }, {
      "$set": {
        'warData': {
          callouts: [{
            user_id: 12345,
            name: 'Test'
          }]
        }
      }
    });

    api.specHelper.runTask('command/attacked', {
      communityId: "55f2009570dae75f9df5f5cc",
      group_id: "13800367",
      user_id: 12345,
      text: '!attacked',
      action: 'callback',
      apiVersion: 1,
      cmdErr: 'NO_FOUND',
      db_command_id: '55f33ca470dae75f9df5f5ce',
      db_group_id: '55f3389370dae75f9df5f5cd',
      args: []
    }, function (response) {

    });
  });
});
