var Board = Ember.Object.extend({
  allRepos: function () {
    return _.union([this],this.get("linkedRepos"))
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
            .groupBy(function(l){return l.name.toLocaleLowerCase() })
            .map(function (g) {
              return _.first(g);
            }).value().sort(function (a,b){
               return a.name.localeCompare(b.name)
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
            .groupBy(function(l){return l.title.toLocaleLowerCase() })
            .value();
  }.property("milestones.length","linkedRepos.@each.milestones.length"),
  moveIssue: function(issue, column, index){
    // begin editing ALL THE THINGS
    Ember.beginPropertyChanges();
    issue.beginPropertyChanges();

    if(issue.get('parentController') === column) {
      issue.set("model._data.order", index);
    } else {
      issue.get('parentController.model.issues').beginPropertyChanges();
      column.get('model.issues').beginPropertyChanges();

      issue.set("model._data.order", index);
      issue.get('parentController.model.issues').removeObject(issue.get('model'));
      column.get('model.issues').pushObject(issue.get('model'));

      issue.get('parentController.model.issues').endPropertyChanges();
      column.get('model.issues').endPropertyChanges();
    }
    issue.send("moved", index, column.get('model'));

    Ember.endPropertyChanges();
    issue.endPropertyChanges();
  }
});

module.exports = Board;

