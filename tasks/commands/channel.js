exports.commandChannel = {
    name: "command/channel",
    description: "Channel handler",
    queue: "default",
    frequency: 0,

    run: function(api, params, next) {
        api.groupme('groups/' + params.group_id, 'GET').then(function(response) {
            var message = '';
            var attachments = [{
                loci: [],
                type: 'mentions',
                user_ids: []
            }];
            response.response.members.forEach(function (member) {
                if (member.nickname.indexOf(' Bot') > -1) {
                    return;
                }
                if ((message.length + (' @' + member.nickname).length) > 1000) {
                    sendMessage();
                    message = '';
                    attachments = [{
                        loci: [],
                        type: 'mentions',
                        user_ids: []
                    }];
                }
                var start = 0;
                if (message !== '') {
                    message += ' ';
                    start = message.length + 1;
                }
                message += '@' + member.nickname;

                attachments[0].loci.push([start, ('@' + member.nickname).length]);
                attachments[0].user_ids.push(parseInt(member.id));
            });
            if (message !== '') {
                sendMessage();
            }
            next();

            function sendMessage() {
                api.groupme('groups/' + params.group_id + '/messages', 'POST', {
                    message: {
                        text: message,
                        attachments: attachments
                    }
                });
            }
        });
    }
};
