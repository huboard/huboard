var App = require('./app');

App.Router.map(function() {
   this.resource("index",{path: "/"},function(){
    this.resource("index.issue",{path:"/issues/:issue_id"});
   })

   this.resource("milestones", function(){
    this.resource("milestones.issue",{path:"/issues/:issue_id"});
   })

   this.resource("settings", function(){

    this.resource('settings.integrations', {path: '/integrations'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.resource('settings.links', {path: '/links'}, function(){
      this.route('new', {path: '/new/:name'});
    });

   });
});

App.Router.reopen({
  //location: "history"
});



