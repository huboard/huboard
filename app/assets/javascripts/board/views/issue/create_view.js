var KeyPressHandlingMixin = require("../../mixins/keypress_handling")

var IssuesCreateView = App.ModalView.extend(KeyPressHandlingMixin, {
  registerKeydownEvents: function(){
    self = this;
    ctrl = self.get("controller");

    this.$().find("input").keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) ctrl.send("submit");
      })
      self.enterHandler(e, function(enabled){
        if (!enabled) e.preventDefault();
      })
    });
    this.$().find("textarea").keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) ctrl.send("submit");
      })
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  modalCloseCriteria: function(){
    var textarea = this.$(".markdown-composer textarea")
    if (textarea.val()){
      return textarea.val().length;
    }
    return false;
  },
  focusTitleField: function(){
      Ember.run.schedule("afterRender", this, "focusTextbox");
  }.on("init"),
  focusTextbox: function(){
    var input = this.$("input");
    input.focus();
    input.val(input.val());
  }
});

module.exports = IssuesCreateView;
