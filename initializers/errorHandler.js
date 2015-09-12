module.exports = {
    loadPriority:  1000,
    startPriority: 1000,
    stopPriority:  1000,
    initialize: function(api, next){
        var errReporter = function(err, type, name, objects, severity){
            if (
                objects.connection.params.group_id &&
                objects.connection.params.user_id &&
                objects.connection.params.text &&
                name !== 'tasks:command/error'
            ) {
                // This is an error in the groupme callback
                objects.connection.params.module = name;
                objects.connection.params.err = err;
                api.tasks.enqueue('command/error', objects.connection.params, 'default', function(err, toRun){});
            }
        };

        api.exceptionHandlers.reporters.push(errReporter);
        next();
    },
    start: function(api, next){
        next();
    },
    stop: function(api, next){
        next();
    }
};
