define(function () {
  // really dumb data source right now
     var issues = {
      fetch : function (user,repo){
         var self = this;
         $.ajax({
              url: "/api/" + user + "/" + repo + "/backlog",
              dataType: "json",
              success: function (data){
                 self.trigger("ondatareceived", data);
              }
         });
      }
     };

     _.extend(issues,Backbone.Events);

     return issues;

  


});
