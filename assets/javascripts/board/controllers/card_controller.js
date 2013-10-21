var CardController = Ember.ObjectController.extend({
  actions : {
    dragged: function (column) {
      this.set("model.current_state", column)
    }
  }
});

module.exports = CardController;
