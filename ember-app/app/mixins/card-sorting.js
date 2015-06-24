import Ember from 'ember';

var CardSortingMixin = Ember.Mixin.create({
  initSortable: function(){
    var that = this;
    Ember.$("ul.sortable").sortable({
      tolerance: 'pointer',
      connectWith:"ul.sortable",
      placeholder: "ui-sortable-placeholder",
      items: "li.is-draggable",
      start: function (event, ui) {
        that.set("cardInFlight", ui.item.index());
      },        
      over: function () {
        that.set("isHovering", true);
      },
      out: function () {
        that.set("isHovering", false);
      },
      update: function (event, ui) {
        if (this !== ui.item.parent()[0]){return ;}
        var target_index = ui.item.index();
        var index = that.get("cardInFlight");
        var issues = that.get("sortedIssues");
        var issue = issues.objectAt(index);

        var first = target_index === 0;
        var last = target_index === issues.length - 1;

        if(first && last) {
          issue.reorder(index, that.get("column"));
          return;
        }
        
        var before = target_index ? 
          issues.objectAt(target_index - 1).get("_data.order") : 0;
        var after = issues.objectAt(target_index + 1).get("_data.order");

        if(first) {
          issue.reorder((after || 1) / 2, that.get("column"));
          // dragged it to the top
        } else if (last) {
          // dragged to the bottom
          issue.reorder((before + 1), that.get("column"));
        }  else {
          issue.reorder((((after + before) || 1)/2), that.get("column"));
        }
      }
    });
  }.on("didInsertElement"),
});

export default CardSortingMixin;
