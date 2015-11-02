exports.commandAttacked = {
  name: "command/attacked",
  description: "Attacked command",
  queue: "default",
  frequency: 0,

  run: function (api, params, next) {
    api.database.find('groupmeGroups', {groupId: params.group_id}).then(function(groups) {
      var group = groups[0];

      if (!group.warData || Date.now() >= group.warData.warExipres) {
        api.groupme('groups/' + params.group_id + '/messages', 'POST', {
          "message": {
            "text": 'A war has not been started. Please contact your leader.'
          }
        });
      } else {
        var found = false;
        group.warData.callouts.forEach(function(item, index) {
          if (item && item.user_id === params.user_id) {
            found = index;
          }
        });
        if (found !== false) {
          var obj = {
            $set: {

            }
          };
          obj['$set']['warData.callouts.' + found] = {
            user_id: false
          };
          api.database.updateOne('groupmeGroups', {groupId: params.group_id}, obj);
          api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
              "text": 'Enemy ' + (found+1) + ' has been attacked. It can now be called again.'
            }
          });
        } else {
          api.groupme('groups/' + params.group_id + '/messages', 'POST', {
            "message": {
              "text": 'You currently have no enemy called.'
            }
          });
        }
      }
    });
  }
};
