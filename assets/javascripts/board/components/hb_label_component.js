var HbLabelComponent = Ember.Component.extend({
  tagName: "li",
  classNameBindings: [":card-label","colorClass", "selected:active"],
  didInsertElement: function () {
     this.$().on("click.label", function () {
       this.get("parentView.controller").send("select", this.get("label"))
     }.bind(this))
  },
  willDestroyElement: function () {
    this.$().off("click.label")
    this._super.apply(this, arguments);
  },
  colorClass: function () {
    return "-x" + this.get("label.color");
  }.property(),
  selected: function () {
    
    return this.get("parentView.selected").any(function (l){return l.name == this.get("label.name")}.bind(this))
  }.property("parentView.selected.@each")

});

module.exports = HbLabelComponent;

