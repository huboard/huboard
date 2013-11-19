var CardController = Ember.ObjectController.extend({
  needs:["issueEdit"],
  actions : {
    dragged: function (column) {
      return this.get("model").drag(column);
    },
    moved: function (index){
       return this.get("model").reorder(index);
    },
    fullscreen: function(){
      //this.set("controllers.issueEdit.model",this.get("model"));
      //this.send("openModal","issueEdit")
      this.transitionToRoute("issue", this.get("model"))
    },
    close: function (issue){
      return this.get("model").close();
    }
  },
  canArchive: function () {
    return this.get("model.state") === "closed";
  }.property("model.state"),
  cardLabels: function () {
      return this.get("model.other_labels").map(function(l){
        return Ember.Object.create(_.extend(l,{customColor: "-x"+l.color}));
      });
  }.property("model.other_labels.@each")
});

module.exports = CardController;
