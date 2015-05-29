import Ember from 'ember';

var SettingsLinkView = Ember.View.extend({
  tagName: 'li',
  classNameBindings: ["content.isLinked:hb-state-link:hb-state-unlink"],
  classNames: ["hb-widget-link"],
  onRemove: function(){

  }.on("willDeleteElement")
});

export default SettingsLinkView;
