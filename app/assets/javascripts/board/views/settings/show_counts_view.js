var ShowCountsView = Ember.View.extend({
  classNameBindings: ["showColumnCounts:checked"],
  showColumnCounts: Ember.computed.alias("settings.showColumnCounts"),
  tagName: "li",
  setupClick: function () {
    this.$('a').on("click.settings", function (ev) {
      this.toggleProperty("settings.showColumnCounts");
      ev.preventDefault();
      ev.stopPropagation();
    }.bind(this));
  }.on("didInsertElement"),
  cleanUpEvents : function () {
    this.$('a').off("click.settings")
    
  }
})


module.exports = ShowCountsView;
