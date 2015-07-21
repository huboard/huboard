import Ember from "ember";
import HbColumn from "../columns/hb-column";
import SocketMixin from 'app/mixins/socket';

var HbMilestoneComponent = HbColumn.extend(SocketMixin, {
  classNames: ["milestone"],
  classNameBindings:["isFirstColumn:no-milestone"],
  isTaskColumn: false,

  //Data
  sortedIssues: function () {
    var issues = this.get("issues").filter(function(i){
        return !i.get("isArchived");
      })
      .filter(this.get("model.filterBy"))
      .sort(this.sortStrategy);
    return issues;
  }.property("issues.@each.{milestoneOrder,milestoneTitle}"),
  sortStrategy: function(a,b){
    if(a._data.milestone_order === b._data.milestone_order){
      if(a.repo.fullname === b.repo.fullname){
        console.log("WARN: Duplicate Issues");
        return a.number - b.number;
      }
      return a.repo.fullname - b.repo.fullname;
    }
    return a._data.milestone_order - b._data.milestone_order;
  },
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
    var _self = this;
    Ember.run.schedule("afterRender", _self, function(){
      issue.assignMilestone(order, milestone);
    });
  },
  findMilestone: function(a){
    return function(b){
      return _.isEqual(a.name, b.repo.name);
    };
  },
  handleMissingMilestone: function(issue, order, cancelMove){
    var _self = this;
    this.attrs.createMilestoneOrAbort({
      card: issue,
      column: _self.get("model"),
      onAccept: function(milestone){
        _self.get("model.group").pushObject(milestone);
        _self.moveIssue(issue, order);
      },
      onReject: function(){
        cancelMove();
      }
    });
  },

  topOrderNumber: function(){
    var issues = this.get("issues")
      .filter(function(i) { return !i.get("isArchived");})
      .sort(this.sortStrategy);
    var first = this.get("issues")
      .filter(function(i) { return !i.get("isArchived");})
      .sort(function (a, b){
        return a._data.order - b._data.order;
      }).get("firstObject");
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
  }.property("sortedIssues.[]"),
  isFirstColumn: function(){
    return this.get("columns.firstObject.title") === this.get("model.title");
  }.property("columns.firstObject"),
  isCreateVisible: true,
  milestoneNumber: function(){
    return this.get('model.milestone.number');
  }.property('model.milestone.number'),
  repositoryName: function(){
    return this.get('model.milestone.repo.full_name');
  }.property('model.milestone.repo.full_name'),
  socketDisabled: function(){
    return !!this.get('model.noMilestone');
  }.property('model.noMilestone'),
  sockets: {
    config: {
      messagePath: 'milestoneNumber',
      channelPath: 'repositoryName',
      disabled: 'socketDisabled'
    },
    milestone_reordered: function(message){
      //TODO: refactor the model layer so that milestones are always models
      //
      //this.get('model.milestone').setProperties({
        //description: message.milestone.description,
        //_data: message.milestone._data
      //})
    }
  }
});

export default HbMilestoneComponent;
