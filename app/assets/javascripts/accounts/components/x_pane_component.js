XPaneComponent = Ember.Component.extend({
  visible: true,
  registerTab: function() {
    this.get('parentView').addPane(this);
  }.on("didInsertElement"),
  selected: function() {
    return this.get('parentView.selected') === this;
  }.property('parentView.selected')
});

module.exports = XPaneComponent;
