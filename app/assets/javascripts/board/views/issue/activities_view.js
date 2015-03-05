var KeyPressHandlingMixin = require("../../mixins/keypress_handling")

var CommentView = Ember.View.extend(KeyPressHandlingMixin, {
  templateName: "issue/comment",
  classNames: ["card-comment"],
  registerKeydownEvents: function(){
    var self = this;
    var ctrl = self.get("content");

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

//var ActivitiesView = Ember.Handlebars.EachView.extend({
var ActivitiesView = Ember.CollectionView.extend({
  content: Ember.computed.alias("controller"),
  createChildView: function(viewClass, attrs) {
    if(!attrs.content.model.event) {
       viewClass = CommentView;
    }else{
       viewClass = Ember.View.extend({
         classNames: ["card-event","card-event-" + attrs.content.model.event],
         templateName: "issue/events/" + attrs.content.model.event
       })
    }
    return this._super(viewClass, attrs)
  }

})

module.exports = ActivitiesView;
