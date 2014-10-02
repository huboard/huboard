var SettingsLinkView = Ember.View.extend({
  tagName: 'li',
  classNameBindings: [":hb-widget-link","content.isLinked:hb-state-link:hb-state-unlink"],
  onRemove: function(){

  }.on("willDeleteElement")
});
module.exports = SettingsLinkView;
