var Column = Ember.Object.extend({
  merge: function(issues){
    var column = this;
    var index = column.index;
    var issues = issues.filter(function(i){
      return i.current_state.index === index;
    })
    .filter(function(i) {
      // FIXME: this flag is for archived issue left on the board.
      return !i.get("isArchived");
    })
    .map(function (i){
       i.set("current_state", column);
       return i;
    })
   // .forEach(function(issue){
   //   column.get('issues').insertItemSorted(issue);
   // })
    column.get('issues').pushObjects(issues);

  }
})

Column.reopenClass({
  build: function(column, issues){
    var column = Column.create(column);
    var index = column.index;
    var issues = issues.filter(function(i){
      return i.current_state.index === index;
    })
    .filter(function(i) {
      // FIXME: this flag is for archived issue left on the board.
      return !i.get("isArchived");
    })
    .map(function (i){
       i.set("current_state", column);
       return i;
    })

    var sortedIssues = Ember.ArrayProxy.extend(Ember.SortableMixin)
      .create({
        content: issues,
        sortProperties: ["_data.order"]
      })

    column.set('issues', sortedIssues);
    return column;

  }

})

module.exports = Column;
