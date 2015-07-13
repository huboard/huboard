import Ember from "ember";
import HbColumn from "../columns/hb-column";

var HbMilestoneComponent = HbColumn.extend({
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
});

export default HbMilestoneComponent;
