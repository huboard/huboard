var Milestone = Ember.Object.extend({
  title: Ember.computed.alias("milestone.title"),
  filterBy: function(i){
          return i.milestone && i.milestone.title.toLocaleLowerCase() == this.get("title").toLocaleLowerCase();
  },
  merge: function(milestone, issues) {
    milestone && this.get("group").pushObject(milestone);
    self = this;

    var issues = issues
      .filter(function(i) {
        // FIXME: this flag is for archived issue left on the board.
        return !i.get("isArchived");
      }).filter(this.get("filterBy").bind(this))
      .map(function(i){
        i.set('current_milestone', self);
        return i;
      })

    this.get('issues').pushObjects(issues);
  }
});

Milestone.reopenClass({
  build: function(milestone, issues) {
    var milestone = this.create({
      milestone: milestone,
      group: [milestone]
    })

    var issues = issues
      .filter(function(i) {
        // FIXME: this flag is for archived issue left on the board.
        return !i.get("isArchived");
      }).filter(milestone.get("filterBy").bind(milestone))
      .map(function(i){
        i.set('current_milestone', milestone);
        return i;
      })

      var sortedIssues = Ember.ArrayProxy.extend(Ember.SortableMixin)
        .create({
          content: issues,
          sortProperties: ["_data.milestone_order"]
        });
    milestone.set('issues', sortedIssues);
    return milestone;
  }
})

module.exports = Milestone;
