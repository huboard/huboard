XTabsComponent = Ember.Component.extend({
  init: function() {
    this._super.apply(this, arguments);
    this.panes = [];
  },

  addPane: function(pane) {
    if (this.get('panes.length') == 0) this.select(pane);
    this.panes.pushObject(pane);
  },

  select: function(pane) {
    this.set('selected', pane);
  }
});

module.exports = XTabsComponent;
