import KeyPressHandlingMixin from 'app/mixins/key-press-handling';
import BufferedMixin from 'app/mixins/buffered';
import Ember from 'ember';
import IssueActivity from 'app/components/issue/activities/issue-activity';


var IssueCommentComponent = IssueActivity.extend(BufferedMixin, KeyPressHandlingMixin, {
  layoutName: "issue/comment",
  classNames: ["card-comment"],
  content: Ember.computed.alias('model'),
  disabled: function(){
    return this.get('isEmpty');
  }.property('isEmpty'),
  isEmpty: function(){
    return Ember.isBlank(this.get('bufferedContent.body'));
  }.property('bufferedContent.body'),
  canEdit: function(){
    return this.get("isLoggedIn") &&
      ( this.get("isCollaborator") || (this.get("currentUser.id") === this.get("model.user.id")) );

  }.property('{isCollaborator,isLoggedIn,currentUser}'),
  registerKeydownEvents: function(){
    var self = this;

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled){ self.send("save"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
  actions: {
    taskChanged: function(body){
      this.set('bufferedContent.body', body);
      this.send('save');
    },
    edit: function(){
      this.set("isEditing", true);
    },
    save: function() {
      if(this.get('isEmpty')){
        return;
      }
      var controller = this,
        model = controller.get('model'),
        url = "/api/" + this.get("issue.repo.full_name") + "/issues/comments/" + this.get("model.id");

      this.get('bufferedContent').applyBufferedChanges();

      controller.set("disabled", true);

      if(this._last) { this._last.abort(); }
      this._last = Ember.$.ajax({
        url: url,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({comment: this.get("model")}),
        success: function(response){
          Ember.set(model, "body_html", response.body_html);
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

export default IssueCommentComponent;
