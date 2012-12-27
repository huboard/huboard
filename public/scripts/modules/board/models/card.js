define(["../events/postal"],function(postal){

  var card = function(params) {
   this.attributes = params.model;
   this.user = params.user;
   this.repo = params.repo;
  };

  _.extend(card.prototype, {
    save : function (data) {
      $.post("/api/" + this.attributes.repo.owner.login + "/" + this.attributes.repo.name + "/movecard",{
        index: data.index,
        issue: this.attributes,
        correlationId: postal.correlationId
      }, function (response) {
        //console.log("moved to column", data.index);
      });
    },
    close: function(data) {
      $.post("/api/" + this.attributes.repo.owner.login + "/" + this.attributes.repo.name + "/close",{
        index: data.index,
        issue: this.attributes,
        correlationId: postal.correlationId
      }, function (response) {
        //console.log("closed issue", data.index);
      });
    },
    assign: function(assignee){
      this.attributes.assignee = assignee;
      $.post("/api/" + this.attributes.repo.owner.login + "/" + this.attributes.repo.name + "/assigncard",{
        issue: this.attributes,
        assignee: assignee.login
      }, function(response) {

      });

    },
    reorder: function(data) {
      $.post("/api/" + this.attributes.repo.owner.login + "/" + this.attributes.repo.name + "/reorderissue",{
        index: data.order,
        issue: this.attributes,
        correlationId: postal.correlationId
      }, function (response) {
        //console.log("reordered issue", data.order);
      });

    }
  });

  return card;
});
