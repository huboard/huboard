var SearchView = Ember.View.extend({
  classNames: ["search"],
  didInsertElement: function () {
    var that = this;
    this.$().find(".ui-icon-search").on("click.hbsearch", function () {
        that.$().find("input").focus();
    });
    return this._super();
  },
  didDestroyElement: function () {
    this.$().find(".ui-icon-search").off("click.hbsearch")
    return this._super();
  }
})

module.exports = SearchView;
