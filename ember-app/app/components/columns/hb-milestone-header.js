import Ember from "ember";

var HbMilestoneHeaderComponent = Ember.Component.extend({
  tagName: "h3",
  attributeBindings: ["milestoneTitle:title"],
  milestoneTitle: Ember.computed.alias("column.title"),
  click: function(){
    this.toggleProperty('isCollapsed');
  }
});

export default HbMilestoneHeaderComponent;
