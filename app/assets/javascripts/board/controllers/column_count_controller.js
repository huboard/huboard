var ColumnCountController = Ember.ObjectController.extend({
  issuesCount: function(){
    return this.get('issues.length');
  }.property("issues.length"),
  isOverWip: function(){
    var wip = this.get('model.wip')
    return wip && this.get("issuesCount") > wip;
  }.property("issuesCount")
})

module.exports = ColumnCountController;

