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
});

module.exports = KeyboardShortcutsView;
