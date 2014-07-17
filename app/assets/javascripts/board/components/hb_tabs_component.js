var HbTabsComponent = Ember.Component.extend({
    classNames: ["tabbable"],
    init: function() {
      this._super.apply(this, arguments);
      this.panes = [];
    },

    addPane: function(pane) {
      if (this.get('panes.length') == 0) this.set("selected", pane);
      this.panes.pushObject(pane);
    },
    actions: {
      select: function(pane) {
        this.set('selected', pane);
      }
    
    }
});

module.exports = HbTabsComponent;

