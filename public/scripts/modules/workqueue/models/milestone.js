define(function(){

  var milestone = function(params){
    this.attributes = params.model;
    this.user = params.user;
    this.repo = params.repo;
  };

  _.extend(milestone.prototype, {

    save : function(data){
      if(!data.order || data.order === 0) {
        console.error("something wrong happened index should not be 0");
        console.log("falling back to original number",this.attributes.number);
        data.order = this.attributes.number
      }
      $.post("/api/"+ this.user + "/" + this.repo + "/reordermilestone",{
        index : data.order,
        status: data.status,
        milestone: this.attributes
      },function (response){
         console.log(response);
      });
    }
  });

  return milestone;

});
