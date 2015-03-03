var ModalView = require("./modal_view")
var KeyPressHandlingMixin = require("../mixins/keypress_handling")

var IssuesView = ModalView.extend(KeyPressHandlingMixin, {
  registerKeydownEvents: function(){
    var self = this;
    this.$().find("textarea").keydown(function(e){
      ctrl = self.get("controller");
      self.metaEnterHandler(e, function(pressed){
        if (pressed) ctrl.send("submitComment");
      })
      self.enterHandler(e, function(pressed){
        if (pressed) e.preventDefault();
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
  }
});

module.exports = IssuesView;
