var AssigneeFilterView = Ember.View.extend({
  templateName : "assignee/filter",
  classNames: ["assignee"],
  classNameBindings: ["modeClass"],
  click: function (){
    var previous = this.get("lastClicked");

    this.set("lastClicked", this);

    if(previous && previous !== this){
      Ember.run.once(function(){
        previous.set("mode", 0);
      })
    }

    this.set("mode", this.get("modes")[this.get("mode") + 1]);
  },
  modeClass : function() {
    var lastClicked = this.get("lastClicked");
    
    if(!lastClicked) return "";

    if (lastClicked === this){
      switch(this.get("mode")) {
        case 0:
          return "";
        break;
        case 1:
          return "active";
        break;
        case 2:
          return "active";
        break;
      }
    }
    switch(lastClicked.get("mode")) {
      case 0:
        return "";
      break;
      case 1:
        return "dim";
      break;
      case 2:
        return "inactive";
      break;
    }
  }.property("lastClicked.mode"),
  mode: 0,
  modes:[0,1,2,0],
  gravatarId: null
});

module.exports = AssigneeFilterView;
