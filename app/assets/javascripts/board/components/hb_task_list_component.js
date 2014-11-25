var HbTaskListComponent = Ember.Component.extend({
  classNames: ["js-task-list-container"],
  onBodyChange: function(){
    this.cleanUp();
    Ember.run.schedule('afterRender', this, "wireUp");
  }.observes('body_html'),
  wireUp: function(){
    var component = this;
    this.$().taskList("enable");
    this.$(".js-task-list-field").on("tasklist:changed", function(){
      component.sendAction("taskChanged", this.value);
    });
  }.on("didInsertElement"),
  cleanUp: function(){
    this.$().taskList("destroy");
  }.on('willDestroyElement')
});

module.exports = HbTaskListComponent
