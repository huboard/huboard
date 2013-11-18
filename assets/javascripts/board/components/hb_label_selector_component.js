var HbLabelSelectorComponent = Ember.Component.extend({
  tagName: "ul",
  classNames: ["labels"],
  selected: [],
  values: [],
  actions: {
    select : function (label) {
      var selected = this.get("selected");
      selected.anyBy("name", label.name) ? selected.removeObject(selected.findBy("name", label.name)) : selected.pushObject(label);
      this.set("values", selected)
    }
  }
});

module.exports = HbLabelSelectorComponent;

