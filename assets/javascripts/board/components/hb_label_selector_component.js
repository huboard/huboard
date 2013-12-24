var HbLabelSelectorComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["labels"],
  editable: true,
  selected: [],
  values: [],
  actions: {
    select : function (label) {
      var selected = this.get("selected");
      selected.anyBy("name", label.name) ? selected.removeObject(selected.findBy("name", label.name)) : selected.pushObject(label);
      this.set("values", selected)
      this.sendAction("labelsChanged")
    }
  }
});

module.exports = HbLabelSelectorComponent;

