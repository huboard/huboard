var CardController = Ember.ObjectController.extend({
  actions : {
    dragged: function (column) {
      this.set("model.current_state", column)
      // this is weird
      var user = this.get("model.repo.owner.login"),
          repo = this.get("model.repo.name"),
          full_name = user + "/" + repo;

      Ember.$.post("/api/" + full_name + "/movecard", {
        index : column.index,
        number : this.get("model.number")
      })
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
