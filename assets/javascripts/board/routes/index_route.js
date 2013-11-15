var CssView = require("../views/css_view");

var IndexRoute = Ember.Route.extend({
  model: function(){
    var repo = this.modelFor("application");
    return App.Board.fetch(repo);
  },
  afterModel: function (model){
    var cssView = CssView.create({
      content: model
    });
    cssView.appendTo("head")
  },
  renderTemplate: function() {
    
    this._super.apply(this, arguments);
    this.render('filters', {into: 'index', outlet: 'sidebarMiddle'})
    this.render('assignee', {into: 'index', outlet: 'sidebarTop'})
  },
  actions :{
    toggleDrawer : function () {
      console.log("toggle drawer")
      var open = $(".toggle-drawer")
        .hasClass("arrow-left");

      open ? this.animateDrawer("close") : this.animateDrawer("open");
    },
    createNewIssue : function () {
      this.controllerFor("issue.create").set("model", App.Issue.createNew());
      this.send("openModal","issue.create")
    }
  },
    animateDrawer : function (direction) {

    switch(direction) {
      case "open":
        $("#drawer")
          .find(".toggle-drawer").removeClass("arrow-right").addClass("arrow-left")
          .end()
          .animate({left: '+=270px'}, 300);
        $("#content").animate({"margin-left": "+=100px"},300);
        break;
      case "close":
        $("#drawer")
          .animate({left: '-=270px'}, 300, function(){
             $(this)
              .find(".toggle-drawer").removeClass("arrow-left").addClass("arrow-right")
              .end();
          });
        $("#content").animate({"margin-left": "-=100px"},300);
    }  
    }

});

module.exports = IndexRoute;
