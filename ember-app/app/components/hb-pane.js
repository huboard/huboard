import Ember from 'ember';

var HbPaneComponent = Ember.Component.extend({
    classNameBindings: ["selected:active"],
    classNames: ["tab-pane"],
    didInsertElement: function() {
      this.get('parentView').addPane(this);
    },

    selected: function() {
      return this.get('parentView.selected') === this;
    }.property('parentView.selected')
});

export default HbPaneComponent;
