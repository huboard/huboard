import Ember from 'ember';

var AssigneeFilterView = Ember.View.extend({
  templateName : "assignee/filter",
  classNames: ["assignee"],
  classNameBindings: ["modeClass", "isFlying"],
  attributeBindings: ["draggable", "data-assignee"],
  draggable: true,
  isFlying: false,
  dragStart: function(ev){
    this.set("isFlying", true);
    ev.dataTransfer.effectAllowed = "copy";
    ev.dataTransfer.setData("text/huboard-assignee", this.get("assignee"));
  },
  dragEnd: function(){
    this.set("isFlying", false);
  },
  click: function (){
    var previous = this.get("lastClicked");

    this.set("lastClicked", this);

    if(previous && previous !== this){
      Ember.run.once(function(){
        if(!previous.isDestroyed){
          previous.set("mode", 0);
        }
      });
    }

    this.set("mode", this.get("modes")[this.get("mode") + 1]);

  },
  modeClass : function() {
    var lastClicked = this.get("lastClicked");
    
    if(!lastClicked){ return ""; }

    if (lastClicked === this){
      switch(this.get("mode")) {
        case 0:
          return "";
        case 1:
          return "active";
        case 2:
          return "active";
      }
    }
    switch(lastClicked.get("mode")) {
      case 0:
        return "";
      case 1:
        return "dim";
      case 2:
        return "inactive";
    }
  }.property("lastClicked.mode"),
  mode: 0,
  modes:[0,1,2,0],
  gravatarId: null
});

export default AssigneeFilterView;
