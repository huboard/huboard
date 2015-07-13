import Ember from "ember";

var HbTaskHeaderComponent = Ember.Component.extend({
  tagName: "h3",
  click: function(){
    this.toggleProperty('isCollapsed');
  }
});

export default HbTaskHeaderComponent;
