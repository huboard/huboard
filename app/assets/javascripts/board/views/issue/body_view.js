var KeyPressHandlingMixin = require("../../mixins/keypress_handling")

var IssueBodyView = Ember.View.extend(KeyPressHandlingMixin, {
  classNames: ["fullscreen-card-description","card-comment"],
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("controller");

    this.$().keydown(function(e){
      self.metaEnterHandler(e, function(enabled){
        if (enabled) ctrl.send("save");
      })
    });
  }.on("didInsertElement"),
  tearDownEvents: function(){
    this.$().off("keydown");
  }.on("willDestroyElement"),
})

module.exports = IssueBodyView;
