var FiltersController = Ember.ObjectController.extend({
  needs: ["index"],
  milestonesBinding: "controllers.index.model.milestones",
  otherLabelsBinding: "controllers.index.model.other_labels",
  lastUserFilterClicked: null,
  lastUserFilterClickedChanged: function(){
    var self = this;
    this.get("userFilters").filter(function(f){
      return f.name != self.get("lastUserFilterClicked");
    }).forEach(function(f){
      Ember.set(f,"mode", 0);
    })
  }.observes("lastUserFilterClicked"),
  userFilters: [
    {
      name: "Assigned to me",
      mode: 0,
      condition: function(i){
        return i.assignee && i.assignee.login === App.get("currentUser").login;
      }
    },

    {
      name: "Assigned to others",
      mode: 0,
      condition: function(i){
        return i.assignee && i.assignee.login !== App.get("currentUser").login;
      }
    },
    {
      name: "Unassigned issues",
      mode: 0,
      condition: function(i){
        return !i.assignee;
      }
    }
  ],
  milestoneFilters: null,
  lastMilestoneFilterClickedChanged: function(){
    var self = this;
    this.get("milestoneFilters").filter(function(f){
      return f.name != self.get("lastMilestoneFilterClicked");
    }).forEach(function(f){
      Ember.set(f,"mode", 0);
    })
  }.observes("lastMilestoneFilterClicked"),
  init: function(){
    this.set("milestoneFilters", this.get("milestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        mode:0,
        condition:function(){}
       })
    }));
    this.set("labelFilters", this.get("otherLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        mode:0,
        condition:function(){}
       })
    }));
  },
  lastMilestoneFilterClicked: null,
  lastLabelFilterClicked: null,
  dimFiltersChanged: function(){
    var allFilters = this.get("milestoneFilters")
                        .concat(this.get("userFilters"))
                        .concat(this.get("labelFilters"));

    this.set("dimFilters", allFilters.filter(function(f){
      return f.mode == 1;
    }));

  }.observes("milestoneFilters.@each.mode", "userFilters.@each.mode","labelFilters.@each.mode"),
  dimFiltersBinding: "App.dimFilters"
  
});

module.exports = FiltersController;
