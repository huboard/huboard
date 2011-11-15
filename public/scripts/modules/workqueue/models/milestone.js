define(function(){

  var milestone = function(params){
    this.attributes = params.model;
    this.user = params.user;
    this.repo = params.repo;
  };

  _.extend(milestone.prototype, {

    save : function(data){
      $.post("/api/"+ this.user + "/" + this.repo + "/reordermilestone",{
        index : data.order,
        milestone: this.attributes
      },function (response){
         console.log(response);
      });
    }
  });

  return milestone;

});
