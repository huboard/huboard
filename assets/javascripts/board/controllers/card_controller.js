var CardController = Ember.ObjectController.extend({
  actions : {
    dragged: function (column) {
      this.set("model.current_state", column)
    }
  },
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels")
});

module.exports = CardController;
