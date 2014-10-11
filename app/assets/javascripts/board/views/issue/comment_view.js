var IssueCommentView = Ember.View.extend({
  content: Ember.computed.alias("controller")
})

module.exports = IssueCommentView;
