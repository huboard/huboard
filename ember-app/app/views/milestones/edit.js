import ModalView from 'app/views/modal';
import KeyPressHandlingMixin from 'app/mixins/key-press-handling';

var MilestonesEditView = ModalView.extend(KeyPressHandlingMixin, {
  classNames: ['milestone-edit'],
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
    if (this.get("controller.processing")){
      return true;
    }

    var textarea = this.$(".markdown-composer textarea");
    if (textarea.val() && textarea.val().length){
      return true;
    }

    return false;
  },
  actions: {
    modalCloseAction: function(){
      var processing = this.get("controller.processing");
        if(processing){
          return;
        }
        var closeModal = confirm("Any unsaved work may be lost! Continue?");
        if(closeModal){ this.get('controller').send('closeModal'); }
    }
  }
});

export default MilestonesEditView;
