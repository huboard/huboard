define(["./views/milestones_list"],
       function(milestones){
         var app = {
                milestonesList: new milestones()
         }; 

         return {
           init : function(params) {
           }
         }
       });
