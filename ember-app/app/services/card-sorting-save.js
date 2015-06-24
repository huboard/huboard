import Ember from 'ember';

var CardSortingService = Ember.Service.extend({
  issues: [],
  columns: [],

  start: function(){
    if(this.get("started")){return;}
    var self = this;
    Ember.$("ul.sortable").sortable({
      tolerance: 'pointer',
      connectWith:".sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      start: function (event, ui) {
        var issue = self.get("issues").objectAt(ui.item.index());
        self.set("originIndex", ui.item.index());
      },        
      over: function (event, ui) {
        self.set("isHovering", true);
        var issue = self.get("issues").objectAt(ui.item.index());
        var column = self.get("columns").filter(function(column){
          return column.index === issue.current_state.index;
        })[0];
        self.set("targetColumn", column);
      },
      out: function () {
        self.set("isHovering", false);
      },
      update: function (event, ui) {
        var target_index = ui.item.index();
        var column = self.get("targetColumn");
        var index = self.get("originIndex");
        var issues = self.get("issues");
        var issue = issues.objectAt(index);
        debugger;

        var first = target_index === 0;
        var last = target_index === issues.length - 1;

        if(first && last) {
          issue.reorder(index, column);
          return;
        }
        
        var before = target_index ? 
          issues.objectAt(target_index - 1).get("_data.order") : 0;
        var after = issues.objectAt(target_index + 1).get("_data.order");

        if(first) {
          issue.reorder((after || 1) / 2, column);
          // dragged it to the top
        } else if (last) {
          // dragged to the bottom
          issue.reorder((before + 1), column);
        }  else {
          issue.reorder((((after + before) || 1)/2), column);
        }
      }
    });
    this.set("started", true);
  }.on("init"),
});

export default CardSortingService;
