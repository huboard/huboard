import BufferedController from 'app/controllers/buffered';
import Ember from 'ember';


var IssueBodyController = BufferedController.extend({
  needs: ["issue"],
  isCollaboratorBinding: "model.repo.is_collaborator",
  isLoggedInBinding: "App.loggedIn",
  currentUserBinding: "App.currentUser",
  mentions: Ember.computed.alias("controllers.issue.mentions"),
  isEditing: false,
  disabled: function(){
    return this.get('isEmpty');
  }.property('isEmpty'),
  isEmpty: function(){
    return Ember.isEmpty(this.get('model.bufferedContent.body'));
  }.property('model.bufferedContent.body'),
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  actions: {
    taskChanged: function(body) {
      this.set('bufferedContent.body', body);
      this.send('save');
    },
    edit: function(){
      Ember.run(function(){
        this.set("isEditing", true); 
      }.bind(this));
    },
    save: function() {
      if(this.get('isEmpty')){
        return;
      }

      var controller = this,
        model = controller.get("model"),
        url = "/api/" + this.get("controllers.issue.model.repo.full_name") + "/issues/" + this.get("model.number");

      this.get('bufferedContent').applyBufferedChanges();

      controller.set("disabled", true);

      if(this._last) { this._last.abort(); }
      this._last = Ember.$.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({body: this.get("model.body")}),
        success: function(response){
          model.set("body_html", response.body_html);
          if(controller.isDestroyed || controller.isDestroying){
            return;
          }
          controller.set("disabled", false);
          controller.set("isEditing", false);
          controller._last = null;
        }
      });
    },

    cancel: function() {
      this.get('bufferedContent').discardBufferedChanges();
      this.set("isEditing", false);
    }
  }
});

export default IssueBodyController;
