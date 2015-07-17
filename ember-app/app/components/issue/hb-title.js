import Ember from 'ember';
import KeyPressHandlingMixin from 'app/mixins/key-press-handling';
import BufferedMixin from 'app/mixins/buffered';

var IssueTitleComponent = Ember.Component.extend(BufferedMixin,KeyPressHandlingMixin,{
  classNames: ["fullscreen-header"],
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
        if (enabled) { ctrl.send("save"); }
      });
      self.enterHandler(e, function(enabled){
        if (enabled){ ctrl.send("save"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  isCollaboratorBinding: "model.repo.is_collaborator",
  isLoggedInBinding: "App.loggedIn",
  currentUserBinding: "App.currentUser",
  isEditing: false,
  disabled: false,
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  actions: {
    edit: function(){
      Ember.run.schedule('afterRender', this, 'focusTextbox');
      this.set("isEditing", true);
    },
    save: function() {
      var controller = this,
        url = "/api/" + this.get("model.repo.full_name") + "/issues/" + this.get("model.number");

      this.get('bufferedContent').applyBufferedChanges();

      controller.set("disabled", true);

      Ember.$.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({title: this.get("model.title")}),
        success: function(response){
          controller.set("disabled", false);
          controller.set("model.title", response.title);
          controller.set("isEditing", false);
        }
      });
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
});

export default IssueTitleComponent;

