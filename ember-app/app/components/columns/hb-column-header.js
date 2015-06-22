import Ember from "ember";

var HbColumnHeaderComponent = Ember.Component.extend({
  tagName: "h3",
  click: function(){
    this.toggleProperty('isCollapsed');
  }
});

export default HbColumnHeaderComponent;
