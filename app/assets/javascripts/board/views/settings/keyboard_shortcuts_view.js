var KeyboardShortcutView = require("./keyboard_shortcut_view");

var KeyboardShortcutsView = Ember.CollectionView.extend({
  content: [
    {
      description: "Submit on Meta + Enter",
      key: "metaEnterEnabled",
      default_enable: true
    },
    {
      description: "Submit on Enter (not applicable to text areas)",
      key: "enterEnabled",
      default_enable: false
    }
  ],
  itemViewClass: KeyboardShortcutView,

  store: Ember.computed.alias("settings"),
  storeData: function(){
    return this.get("store").loadData()["settings"];
  }.property("store"),
});

module.exports = KeyboardShortcutsView;
