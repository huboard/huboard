define(["./views/milestones_list"],
       function(milestones){
         var app = {
         }; 

         return {
           init : function(params) {
             app.milestones = new milestones(params);
           }
         }
       });
