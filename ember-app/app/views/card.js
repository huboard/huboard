import Ember from 'ember';
import template from 'app/templates/card';

var CardView = Ember.View.extend({
  template: template,
  classNameBindings:["stateClass"],
  stateClass: function(){
     var github_state = this.get("controller.model.state");
     if(github_state === "closed"){
       return "hb-state-" + "closed";
     }
     var custom_state = this.get("controller.model.customState");
     if(custom_state){
       return "hb-state-" + custom_state;
     }
     return "hb-state-open";
  }.property("controller.model.current_state", "controller.model.customState", "controller.model.state"),
  didInsertElement: function () {
    this._super();
    this.$("a, .clickable").on("click.hbcard", function (ev){ ev.stopPropagation(); } );
  },
  willDestroyElement : function () {
    this.$("a, .clickable").off("click.hbcard");
    return this._super();
  }
});

export default CardView;
