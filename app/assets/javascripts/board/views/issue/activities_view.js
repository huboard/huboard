var CommentView = Ember.View.extend({
  templateName: "issue/comment",
  classNames: ["card-comment"]
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
