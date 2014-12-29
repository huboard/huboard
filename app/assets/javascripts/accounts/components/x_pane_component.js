XPaneComponent = Ember.Component.extend({
  didInsertElement: function() {
    this.get('parentView').addPane(this);
  },

  selected: function() {
    return this.get('parentView.selected') === this;
  }.property('parentView.selected')
});

module.exports = XPaneComponent;
