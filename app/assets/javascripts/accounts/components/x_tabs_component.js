XTabsComponent = Ember.Component.extend({
  init: function() {
    this._super.apply(this, arguments);
    this.panes = [];
  },

  addPane: function(pane) {
    if (this.get('panes.length') == 0) this.selectPane(pane);
    this.panes.pushObject(pane);
  },
  selectPane: function(pane){
      this.set('selected', pane);
  },
  actions: {
    select: function(pane) {
      this.selectPane(pane);
    }
  }
});

module.exports = XTabsComponent;
