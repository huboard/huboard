var HbLabelSelectorComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["labels"],
  selected: [],
  values: [],
  actions: {
    select : function (label) {
      var selected = this.get("selected");
      selected.contains(label) ? selected.removeObject(label) : selected.pushObject(label);
      this.set("values", selected)
    }
  }
});

module.exports = HbLabelSelectorComponent;

