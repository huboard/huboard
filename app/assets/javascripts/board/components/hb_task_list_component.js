var HbTaskListComponent = Ember.Component.extend({
  classNames: ["js-task-list-container"],
  onBodyChange: function(){
    Ember.run(this, function(){
      this.set("bodyMarkup", this.get('body_html'));
    });
  }.observes('body_html'),
  bodyMarkup: function(key, value){
    if(arguments.length > 1){
      this.cleanUp();
      Ember.run.schedule('afterRender', this, "wireUp");
      return value;
    } else {
      return this.get("body_html")
    }
  }.property(),
  wireUp: function(){
    if (this.get('canEdit')) {
      var component = this;
      this.$().taskList("enable");
      this.$(".js-task-list-field").on("tasklist:changed", function(){
        component.sendAction("taskChanged", this.value);
      });
    }
  }.on("didInsertElement"),
  cleanUp: function(){
    this.$().taskList("destroy");
    this.$(".js-task-list-field").off("tasklist:changed");
  }.on('willDestroyElement')
});

module.exports = HbTaskListComponent
