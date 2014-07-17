var HbPaneComponent = Ember.Component.extend({
    classNameBindings: [":tab-pane","selected:active"],
    didInsertElement: function() {
      this.get('parentView').addPane(this);
    },

    selected: function() {
      return this.get('parentView.selected') === this;
    }.property('parentView.selected')
});

module.exports = HbPaneComponent;

