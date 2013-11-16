var HbLabelSelectorComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["labels"],
  selected: [],
  actions: {
    select : function (label) {
      this.selected.contains(label) ? this.selected.removeObject(label) : this.selected.pushObject(label);
    }
  }
});

module.exports = HbLabelSelectorComponent;

