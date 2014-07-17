var CommentView = Ember.View.extend({
  templateName: "issue/comment",
  classNames: ["card-comment"]
})

var EventView = Ember.View.extend({
  templateName: "issue/event",
  classNames: ["card-event"]
})


var ActivitiesView = Ember.CollectionView.extend({
  content: Ember.computed.alias("activities"),
  createChildView: function(viewClass, attrs) {
    if(attrs.content.type == "comment") {
       viewClass = CommentView;
    }
    if(attrs.content.type == "event") {
       viewClass = Ember.View.extend({
         classNames: ["card-event","card-event-" + attrs.content.event],
         templateName: "issue/events/" + attrs.content.event
       })
    }
    return this._super(viewClass, attrs)
  }

})

module.exports = ActivitiesView;
