var CardView = Ember.View.extend({
  classNameBindings:["stateClass"],
  stateClass: function(){
     return "hb-state-" + this.get("controller.model.state");
  }.property("controller.model.current_state", "controller.model.state"),
  didInsertElement: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ console.log(arguments); ev.stopPropagation(); } )
  },
  willDestroyElement : function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  }

  
});

module.exports = CardView;

