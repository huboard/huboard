var FilterView = Ember.View.extend({
  tagName: "li",
  templateName: "filter",
  classNames: ["filter"],
  classNameBindings: ["customColor", "reportTagType"],
  reportTagType: function() {
    return this.get('tagType');
  }.property('tagType'),
  customColor: function () {
    return this.get("color") ? "-x" + this.get('color') : "";
  }.property("color"),
  click: function(ev){
    ev.preventDefault();
    var $target = $(ev.target);
    this.set("lastClicked", this.get("name"));
    var formattedParam = this.get("name").replace(/\s+/g, '');
    var queryParams = this.get("controller").get(this.get("queryParam"));
    if($target.is(".ui-icon")){
      queryParams.removeObject(formattedParam);
      this.set("mode", 0);
      return;
    }
    this.set("mode", this.get("modes")[this.get("mode") + 1]);
    this.queryParamsHandler(queryParams, formattedParam);
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
  queryParamsHandler: function(params, formattedParam){
    if(this.get("mode") == 0) {
      params.removeObject(formattedParam);
      return;
    }
    //If this is not a label and is dimmed,
    //remove any filters of this type from the URL's 's
    if(this.get("mode") == 1 && this.get("queryParam") != "label") {
      params.clear();
      return;
    }
    if (this.get("mode") == 2 && !params.contains(formattedParam)){
      params.pushObject(formattedParam);
      return;
    }
  },
  activatePrexistingFilters: function(){
    var formattedParam = this.get("name").replace(/\s+/g, '');
    var queryParams = this.get("controller").get(this.get("queryParam"));
    if (queryParams.contains(formattedParam)){ this.set("mode", 2); }
  }.on("didInsertElement"),
  mode: 0,
  modes:[0,1,2,0],
  name: null,
  lastClicked: null,
})

module.exports = FilterView;
