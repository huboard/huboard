define(function(){
  // really dumb data source right now
     var milestones = {
      fetch : function (user,repo){
         var self = this;
         $.ajax({
              url: "api/" + user + "/" + repo + "/milestones",
              dataType: "json",
              success: function (data){
                 self.trigger("ondatareceived", data);
              }
         });
      }
     };

     _.extend(milestones,Backbone.Events);

     return milestones;


});
