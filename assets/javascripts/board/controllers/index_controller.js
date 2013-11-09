var IndexController = Ember.ObjectController.extend({
  board_columns: function(){
     return this.get("columns");
  }.property("columns"),
  min_height: function(){
     return _(Ember.$(".sortable")).chain()
        .map(function(ul){ return $(ul).height(); })
        .reduce(function(tallest, height){return height > tallest ? height : tallest;})
        .value() || 100;
  }.property("issues.@each.current_state","resizeTrigger"),
  resizeTrigger: 0,
  header_style: function() {
    return "";
    return "width:" + (100/this.get("board_columns").length) + "%;";
  }.property("board_columns","min_height"),

  column_style: function() {
    return "";
    return "min-height:" + this.get("min_height") + "px";
  }.property("board_columns","min_height")

});

module.exports = IndexController;
