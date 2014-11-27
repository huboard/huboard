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
    var queryAlreadyThere = params.contains(formattedParam);
    if(this.get("modeClass") == "") {
      params.removeObject(formattedParam);
      return;
    }
    //If this is not a label, remove any filters of this class from QP's
    if(this.get("modeClass") == "dim" && this.get("queryParam") != "labelqp") {
      params.clear();
      return;
    }
    if (this.get("modeClass") == "active" && !queryAlreadyThere){
      params.pushObject(formattedParam);
      return;
    }
  },
  activatePrexistingFilters: function(){
    var formattedParam = this.get("name").replace(/\s+/g, '');
    var queryParams = this.get("controller").get(this.get("queryParam"));
    var queryAlreadyThere = queryParams.contains(formattedParam);
    if (queryAlreadyThere){ this.set("mode", 2); }
  }.on("didInsertElement"),
  mode: 0,
  modes:[0,1,2,0],
  name: null,
  lastClicked: null,
})

module.exports = FilterView;
