var App = require('./app');

App.Router.map(function() {
   this.resource("index",{path: "/"},function(){
    this.resource("index.issue",{path:"/issues/:issue_id"});
    this.resource('index.integrations', {path:"/integrations"});
   })

   this.resource("milestones", function(){
    this.resource("milestones.issue",{path:"/issues/:issue_id"});
    this.route('integrations');
   })
});

App.Router.reopen({
  //location: "history"
});



