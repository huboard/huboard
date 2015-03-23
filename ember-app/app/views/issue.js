import ModalView from 'app/views/modal';
import KeyPressHandlingMixin from 'app/mixins/key-press-handling';



var IssueView = ModalView.extend(KeyPressHandlingMixin, {
  registerKeydownEvents: function(){
    var self = this;
    $("div.fullscreen-card").keydown(function(e){
      ctrl = self.get("controller");
      self.metaEnterHandler(e, function(pressed){
        if (pressed) ctrl.send("submitComment");
      })
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    $("div.fullscreen-card").off("keydown");
  }.on("willDestroyElement"),
  modalCloseCriteria: function(){
    var textarea = this.$(".markdown-composer textarea")
    if (textarea.val()){
      return textarea.val().length;
    }
    return false;
  }
});

export default IssueView;
