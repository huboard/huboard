var IndexController = Ember.ObjectController.extend({
  columns: function(){
     return this.get("labels").splice(1);
  }.property(),

  column_style: function() {
    return "width:" + (100/this.get("columns").length) + "%";
  }.property(),

  allIssues: function() {
    return _.chain(this.get("labels"))
      .map(function(l){return l.issues})
      .flatten()
      .value();
  }.property()
});

module.exports = IndexController;
