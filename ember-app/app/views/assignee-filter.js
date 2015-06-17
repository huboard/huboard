import Ember from 'ember';

var AssigneeFilterView = Ember.View.extend({
  templateName : "assignee/filter",
  classNames: ["assignee"],
  classNameBindings: ["modeClass", "isFlying"],
  attributeBindings: ["draggable", "data-assignee"],
  draggable: true,
  isFlying: false,
  filters: Ember.inject.service(),
  dragStart: function(ev){
    this.set("isFlying", true);
    ev.dataTransfer.effectAllowed = "copy";
    ev.dataTransfer.setData("text/huboard-assignee", this.get("assignee"));
  },
  dragEnd: function(){
    this.set("isFlying", false);
  },
  click: function(ev){
    ev.preventDefault();
    var $target = Ember.$(ev.target); // jshint ignore:line
    this.set("mode", this.get("modes")[this.get("mode") + 1]);
  },
  modeClass: function(){
    switch(this.get("mode")){
      case 0:
        if(this.get("activeAvatarsPresent")){return "inactive";}
        if(this.get("dimAvatarsPresent")){return "dim";}
        return "";
      case 1:
        return "";
      case 2:
        return "active";
    }
    return "";
  }.property("mode", "activeAvatarsPresent"),
  activeAvatarsPresent: function(){
    return this.get("filters.memberFilters").any(function(f){
      return f.mode === 2;
    });
  }.property("filters.memberFilters.@each.mode"),
  dimAvatarsPresent: function(){
    return this.get("filters.memberFilters").any(function(f){
      return f.mode === 1;
    });
  }.property("filters.memberFilters.@each.mode"),

  mode: 0,
  modes:[0,1,2,0],
  gravatarId: null
});

export default AssigneeFilterView;
