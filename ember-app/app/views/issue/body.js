import KeyPressHandlingMixin from 'app/mixins/key-press-handling';
import Ember from 'ember';


var IssueBodyView = Ember.View.extend(KeyPressHandlingMixin, {
  classNames: ["fullscreen-card-description","card-comment"],
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("controller");

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled){ ctrl.send("save"); }
      });
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
});

export default IssueBodyView;
