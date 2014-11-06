var IssueQuickCreateView = Ember.View.extend({
  placeholderText: "Add issue",
  bindToFocus: function(){
    var view = this;
    this.$('input').on('focus.huboard', function() {
      view.set('placeholderText', 'Add title then ↵');
    });
    this.$('input').on('blur.huboard', function() {
      view.set('placeholderText', 'Add issue...');
    });
  }.on('didInsertElement'),
  releaseEvents: function(){
    this.$('input').off('blur.huboard focus.huboard');
  }.on('willDestroyElement')
})
module.exports = IssueQuickCreateView;
