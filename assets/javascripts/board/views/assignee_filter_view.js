var AssigneeFilterView = Ember.View.extend({
  templateName : "assignee/filter",
  classNames: ["assignee"],
  classNameBindings: ["modeClass"],
  click: function (){
    this.set("lastClicked", this);
  },
  gravatarId: null
});

module.exports = AssigneeFilterView;
