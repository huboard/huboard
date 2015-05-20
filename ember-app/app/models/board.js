import Ember from 'ember';
import Issue from 'app/models/issue';

var Board = Ember.Object.extend({
  allRepos: function () {
    return _.union([this],this.get("linkedRepos"));
  }.property("linkedRepos.@each"),
  linkedRepos: [],
  topIssue: function() {
    var firstColumn = this.get("columns.firstObject");
    var firstIssue = this.get("combinedIssues").filter(function(i){
      return i.current_state.index === firstColumn.index;
    }).sort(function (a, b){
       return a._data.order - b._data.order;
    })[0];

    return firstIssue;

  },
  combinedIssues: function () {                                                                        
     return _.union.apply(_,[this.issues].concat(this.linkedRepos.map(function (r){return r.issues; })));
  }.property("linkedRepos.@each.issues.length", "issues.length"),
  combinedLabels :function () {
    return _.union.apply(_,[this.other_labels]
                    .concat(this.linkedRepos.map(function (r){return r.other_labels; })));

  }.property("linkedRepos.@each.issues.length", "issues.length"),
  filterLabels: function () {
    var labels = this.get("combinedLabels");

    return _.chain(labels)
            .groupBy(function(l){return l.name.toLocaleLowerCase(); })
            .map(function (g) {
              return _.first(g);
            }).value().sort(function (a,b){
               return a.name.localeCompare(b.name);
            });
  }.property(),
  filterMilestones: function () {
    return _.chain(this.get("combinedMilestones"))
            .map(function (g) {
              return _.first(g);
            })
            .value();
  }.property("combinedMilestones"),
  combinedMilestones: function(){
    var milestones = _.union.apply(_,[this.milestones]
                    .concat(this.linkedRepos.map(function (r){return r.milestones; })));
    return _.chain(milestones)
            .groupBy(function(l){return l.title.toLocaleLowerCase(); })
            .value();
  }.property("milestones.length","linkedRepos.@each.milestones.length"),
  combinedAssignees: function(){
    var assignees = this.get("assignees");
    var linked = this.get("linkedRepos").map(function(repo){
      return repo.assignees;
    });
    linked = _.flatten(linked);
    linked =  _.reject(linked, function(assignee){
      return _.find(assignees, function(a){
        return a.login === assignee.login;
      });
    });
    return _.union(linked, assignees);
  }.property("assignees.length"),
  combinedRepos: function(){
    var combined = [this];
    combined.pushObject(this.get("linkedRepos"));
    return _.flatten(combined);
  }.property("linkedRepos.@each")
});
Board.reopenClass({
  fetch: function(repo) {
    if(this._board) {return this._board;}
    return Ember.$.getJSON("/api/v2/" + repo.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(Issue.create(i));
       });
       this._board =  Board.create(_.extend(board, {issues: issues}));
       return this._board;
    }.bind(this));
  }
});

export default Board;
