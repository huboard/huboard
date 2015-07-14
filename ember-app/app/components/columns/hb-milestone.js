import Ember from "ember";
import HbColumn from "../columns/hb-column";

var HbMilestoneComponent = HbColumn.extend({
  classNames: ["column","milestone"],

  //Data
  sortedIssues: function () {
    var issues = this.get("issues")
      .filter(function(i) {
        // FIXME: this flag is for archived issue left on the board.
        return !i.get("isArchived");
      }).sort(function (a, b){
        return a._data.milestone_order - b._data.milestone_order;
      })
      .filter(this.get("model.filterBy"));
    return issues;
  }.property("issues.@each.{milestoneOrder,milestoneTitle}"),
  moveIssue: function(issue, order, cancelMove){
    //TODO issue.assignMilestone
    var findMilestone = this.findMilestone(issue.repo);
    var milestone = this.get("model.group").find(findMilestone);
    if(!milestone){
      return this.handleMissingMilestone(issue, order, cancelMove);
    }

    this.get("sortedIssues").removeObject(issue);
    var self = this;
    Ember.run.schedule("afterRender", self, function(){
      issue.set("_data.milestone_order", order);
      issue.set("milestone", milestone);
    });
  },
  findMilestone: function(a){
    return function(b){
      return _.isEqual(a.name, b.repo.name);
    }
  },
  handleMissingMilestone: function(issue, order, cancelMove){
    var self = this
    this.attrs.createMilestoneOrAbort({
      card: issue,
      column: self.get("model"),
      onAccept: function(milestone){
        self.get("model.group").pushObject(milestone);
        self.moveIssue(issue, order);
      },
      onReject: function(){
        cancelMove();
      }
    });
  },

  topOrderNumber: function(){
    var issues = this.get("issues");
    return issues.get("firstObject._data.milestone_order") / 2;
  }.property("issues.@each", "controllers.milestones.forceRedraw"),
});

export default HbMilestoneComponent;
