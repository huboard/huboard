var KeyboardShortcutView = Ember.View.extend({
  templateName: "settings/keyboard_shortcut_item",
  checked: false,
  didInsertElement: function(){
    var self = this
    this.checkIfEnabled()
    this.$("input").change(function(){
      checked = $(this).is(":checked");
      var key = self.get("content.key");
      self.get("controller.store").saveData(key, checked);
    });
  },
  willDestroyElement: function(){
    this.$("input").off("change");
  },

  checkIfEnabled: function(){
    var key = this.get("content.key");
    var default_enable = this.get("content.default_enable")
    var value = this.get("controller.storeData")[key]
    var checked = (value == undefined || value == null) ?
      default_enable : value;
    this.set("checked", checked);
  }
});

module.exports = KeyboardShortcutView
