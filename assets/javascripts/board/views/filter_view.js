var FilterView = Ember.View.extend({
  tagName: "li",
  templateName: "filter",
  classNames: ["filter"],
  classNameBindings: ["customColor"],
  customColor: function () {
    return this.get("color") ? "-x" + this.get('color') : "";
  }.property("color"),
  click: function(ev){
    ev.preventDefault();
    var $target = $(ev.target);
    this.set("lastClicked", this.get("name"));
    if($target.is(".ui-icon")){
      this.set("mode", 0);
      return;
    }
    this.set("mode", this.get("modes")[this.get("mode") + 1]);
  },
  modeClass: function(){
    switch(this.get("mode")){
      case 0:
        return "";
      break;
      case 1:
        return "dim";
      break;
      case 2:
        return "active";
      break;
    }
    return "";
  }.property("mode"),
  mode: 0,
  modes:[0,1,2,0],
  name: null,
  lastClicked: null
})

module.exports = FilterView;
