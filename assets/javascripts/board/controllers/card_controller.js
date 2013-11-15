var CardController = Ember.ObjectController.extend({
  needs:["issueEdit"],
  actions : {
    dragged: function (column) {
      this.set("model.current_state", column)
      // this is weird
      var user = this.get("model.repo.owner.login"),
          repo = this.get("model.repo.name"),
          full_name = user + "/" + repo;

      Ember.$.post("/api/" + full_name + "/movecard", {
        index : column.index.toString(),
        number : this.get("model.number")
      })
    },
    moved: function (index){
      this.get("model._data.order", index);

      var user = this.get("model.repo.owner.login"),
          repo = this.get("model.repo.name"),
          full_name = user + "/" + repo;

      Ember.$.post("/api/" + full_name + "/reorderissue", {
        number : this.get("model.number"),
        index: index
      })
    },
    fullscreen: function(){
      this.set("controllers.issueEdit.model",this.get("model"));
      this.send("openModal","issueEdit")
      //this.transitionToRoute("issue", this.get("model"))
    },
    close: function (issue){
      this.set("model.state","closed")

      var user = this.get("model.repo.owner.login"),
          repo = this.get("model.repo.name"),
          full_name = user + "/" + repo;

      Ember.$.post("/api/" + full_name + "/close", {
        number : this.get("model.number")
      })
    }
  },
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels")
});

module.exports = CardController;
