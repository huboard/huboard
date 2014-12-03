var AssigneeFilterView = Ember.View.extend({
  templateName : "assignee/filter",
  classNames: ["assignee"],
  classNameBindings: ["modeClass"],
  attributeBindings: ["draggable"],
  draggable: true,
  queryParam: "assignee",
  dragStart: function(ev){
    ev.dataTransfer.effectAllowed = "copy";
    ev.dataTransfer.setData("text/huboard-assignee", this.get("assignee"));
  },
  click: function (){
    var previous = this.get("lastClicked");

    this.set("lastClicked", this);

    if(previous && previous !== this){
      Ember.run.once(function(){
        previous.set("mode", 0);
      })
    }

    this.set("mode", this.get("modes")[this.get("mode") + 1]);

    var formattedParam = this.get("assignee").replace(/\s+/g, '');
    var queryParams = this.get("controller").get(this.get("queryParam"));
    this.queryParamsHandler(queryParams, formattedParam);
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
  queryParamsHandler: function(params, formattedParam){
    if(this.get("mode") == 0 || this.get("mode") == 1) {
      params.clear();
      return;
    }
    if (this.get("mode") == 2 && !params.contains(formattedParam)){
      params.pushObject(formattedParam);
      return;
    }
  },
  activatePrexistingFilters: function(){
    var formattedParam = this.get("assignee").replace(/\s+/g, '');
    var queryParams = this.get("controller").get(this.get("queryParam"));
    if (queryParams.contains(formattedParam)){
      this.set("lastClicked", this);
      this.set("mode", 2);
    }
  }.on("didInsertElement"),
  mode: 0,
  modes:[0,1,2,0],
  gravatarId: null
});

module.exports = AssigneeFilterView;
