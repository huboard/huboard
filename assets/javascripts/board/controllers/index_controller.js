var IndexController = Ember.ObjectController.extend({
  columns: function(){
     return this.get("labels").splice(1);
  }.property(),

  column_style: function() {
    return "width:" + (100/this.get("columns").length) + "%";
  }.property()
});

module.exports = IndexController;
