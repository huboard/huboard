define(function () {
    // really dumb data source right now
    var issues = {
        fetch : function (user,repo){
            var self = this;
            var board = $.ajax({
                url: "/api/" + user + "/" + repo + "/board",
                dataType: "json",
                success: function (data){
                }
            });
            var backlog = $.ajax({
                url: "/api/" + user + "/" + repo + "/column",
                dataType: "json",
            });

            $.when(board)
            .then(function (theBoard) {
                if (!theBoard.labels.length) {
                    window.location.href = "/" + user + "/"+ repo + "/board/create";
                    return;
                }
                // handle first response
                self.trigger("ondatareceived", theBoard);

                _.each(theBoard.labels, function (label) {
                    self.trigger("onissuesreceived." + label.index, label.issues)
                }); 

                self.trigger("afterreceived");

                $.when(backlog)
                .then(function(theBacklog) {
                    self.trigger("onissuesreceived." + theBacklog.index, theBacklog.issues)
                    self.trigger("afterreceived");
                });
            });
        }
    };

    _.extend(issues,Backbone.Events);

    return issues;




});
