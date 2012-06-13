define(["./views/workflowView"],
       function(workflow){
         var app = {
         }; 

         return {
           init : function(params) {
             app.workflow = new workflow(this,params);
           }
         }
       });
