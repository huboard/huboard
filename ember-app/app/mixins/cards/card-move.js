import Ember from "ember";

var CardMoveMixin = Ember.Mixin.create({
  setTheOrderKey: function(){
    var is_column = this.toString().match(/hb-column/);
    var key = is_column ? "order" : "milestone_order";
    this.set("cardMover.orderKey", key);
  }.on("init"),

  cardMover: Ember.Object.create({
    calculateIssueOrder: function(issue_above, issue_below){
      var issue = this.data.card.get("issue");
      if(!issue_above && !issue_below){return issue.get("order"); }
      if(!issue_above){ return this.moveToTop(issue, issue_below); }
      if(!issue_below){ return this.moveToBottom(issue, issue_above); }
      return this.move(issue, issue_above, issue_below);
    },
    move: function(issue, issue_above, issue_below){
      var above_order = issue_above._data[this.get("orderKey")];
      var below_order = issue_below._data[this.get("orderKey")];
      return (above_order + below_order) / 2;
    },
    moveToTop: function(issue, issue_below){
      return (issue_below._data[this.get("orderKey")]) / 2;
    },
    moveToBottom: function(issue, issue_above){
      return issue_above._data[this.get("orderKey")] + 1;
    },
    findCard: function(element, column){
      return column.get("cards").find(function(card){
        return card.$().is(element);
      });
    },
    findColumn: function(element, columns){
      return columns.find(function(column){
        return column.$().is(Ember.$(element).closest(".column"));
      });
    },
    issueAbove: function(index, issues, mod){
      if(index + mod && issues.length){
        return issues.objectAt((index + mod) - 1);
      }
      return null;
    },
    issueBelow: function(index, issues, mod){
      if(!(index + mod) && issues.length){  // jshint ignore:line
        return issues.objectAt(0);
      } else if((index + mod) !== (issues.length - 1)){
        return issues.objectAt(index + mod);
      } else if(index !== (issues.length - 1) && mod){
        return issues.objectAt(index + mod);
      } else if((index + mod) === issues.length - 1){
        return issues.get("lastObject");
      }
      return null;
    },
    indexModifier: function(index, column_changed){
      //Adjust based on issue dragging up or down
      if(column_changed){ return 0; }
      return index >= this.data.originIndex ? 1 : 0;
    }
  })
});

export default CardMoveMixin;
