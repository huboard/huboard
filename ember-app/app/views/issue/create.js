import KeyPressHandlingMixin from 'app/mixins/key-press-handling';
import ModalView from 'app/views/modal';
import Ember from 'ember';


var IssuesCreateView = ModalView.extend(KeyPressHandlingMixin, {
  registerKeydownEvents: function(){
    var self = this,
      ctrl = self.get("controller");

    this.$().find("input").keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled){ ctrl.send("submit"); }
      });
      self.enterHandler(e, function(enabled){
        if (!enabled) { e.preventDefault(); }
      });
    });
    this.$().find("textarea").keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) { ctrl.send("submit"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  modalCloseCriteria: function(){
    var textarea = this.$(".markdown-composer textarea");
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
  }
});

export default IssuesCreateView;
