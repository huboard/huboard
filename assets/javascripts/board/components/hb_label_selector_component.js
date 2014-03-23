var HbLabelSelectorComponent = Ember.Component.extend({
  classNames: ["hb-selector-component", "dropdown"],
  isOpen: function(){
    return false;
  }.property(),
  editable: true,
  selected: [],
  values: [],
  actions: {
    toggleSelector: function(){
      this.set("isOpen", !!!this.$().is(".open"))
      if(this.get("isOpen")) {
        $(".open").removeClass("open")
        this.$().addClass("open")
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();

      } else {
        this.$().removeClass("open")
      }
    },
    select : function (label) {
      var selected = this.get("selected");
      selected.anyBy("name", label.name) ? selected.removeObject(selected.findBy("name", label.name)) : selected.pushObject(label);
      this.set("values", selected)
      this.sendAction("labelsChanged")
    }
  }
});

module.exports = HbLabelSelectorComponent;

