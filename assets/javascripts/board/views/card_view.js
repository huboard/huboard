var CardView = Ember.View.extend({
  classNameBindings:["isClosable:closable", "stateClass"],
  isClosable: function(){
     var currentState = this.get("controller.model.current_state");

     return App.get("loggedIn") && currentState.is_last && this.get("controller.model.state") === "open";


  }.property("controller.model.current_state","controller.model.state"),
  stateClass: function(){
     return "hb-state-" + this.get("controller.model.state");
  }.property("controller.model.current_state", "controller.model.state"),
  click: function(){
     this.get("controller").send("openModal","modal")
  }

  
});

module.exports = CardView;

