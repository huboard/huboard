var KeyPressHandlingMixin = require("../../mixins/keypress_handling")

var IssueTitleView = Ember.View.extend(KeyPressHandlingMixin, {
  classNames: ["fullscreen-header"],
  actions: {
    edit: function() {
      Ember.run.schedule('afterRender', this, 'focusTextbox');
      this.get("controller").send("edit");
    }
  },
  focusTextbox: function(){
    var input = this.$('input');
    input.focus();
    input.val(input.val());
  },
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("controller");

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) ctrl.send("save");
      })
      self.enterHandler(e, function(enabled){
        if (enabled) ctrl.send("save");
      })
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
})

module.exports = IssueTitleView;
