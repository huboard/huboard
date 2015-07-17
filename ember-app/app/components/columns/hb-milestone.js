import Ember from "ember";
import HbColumn from "../columns/hb-column";

var HbMilestoneComponent = HbColumn.extend({
  classNames: ["milestone"],
  classNameBindings:["isFirstColumn:no-milestone"],
  isTaskColumn: false,

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
    if(this.get("model.noMilestone")){
      return this.assignMilestone(issue, order, null);
    }

    var findMilestone = this.findMilestone(issue.repo);
    var milestone = this.get("model.group").find(findMilestone);
    if(!milestone){
      return this.handleMissingMilestone(issue, order, cancelMove);
    }
    this.assignMilestone(issue, order, milestone);
  },
  assignMilestone: function(issue, order, milestone){
    this.get("sortedIssues").removeObject(issue);
    var self = this;
    Ember.run.schedule("afterRender", self, function(){
      issue.assignMilestone(order, milestone);
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
    var first = this.get("registerColumns.firstObject.sortedIssues.firstObject");
    var issues = this.get("sortedIssues");
    if(issues.length){
      var order = { milestone_order: issues.get("firstObject._data.milestone_order") / 2};
      if(first){
        order.order = first._data.order / 2;
      }
      return order;
    } else {
      if(first){
        return { order: first._data.order / 2 };
      }
      return {};
    }
  }.property("sortedIssues.@each"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.title") === this.get("model.title");
  }.property("columns.firstObject"),
  isCreateVisible: true
});

export default HbMilestoneComponent;
