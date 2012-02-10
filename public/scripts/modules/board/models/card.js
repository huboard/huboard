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
    },
    close: function(data) {
      $.post("/api/" + this.user + "/" + this.repo + "/close",{
        index: data.index,
        issue: this.attributes
      }, function (response) {
        console.log("closed issue", data.index);
      });
    },
    reorder: function(data) {
      $.post("/api/" + this.user + "/" + this.repo + "/reorderissue",{
        index: data.order,
        issue: this.attributes
      }, function (response) {
        console.log("reordered issue", data.order);
      });

    }
  });

  return card;
});
