define(function(){

  var card = function(params) {
   this.attributes = params.model;
   this.user = params.user;
   this.repo = params.repo;
  };

  _.extend(card.prototype, {
    save : function (data) {
      $.post("/api/" + this.user + "/" + this.repo + "/movecard",{
        index: data.index,
        issue: this.attributes
      }, function (response) {
        console.log("moved to column", data.index);
      });
    }
  });

  return card;
});
