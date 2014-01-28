var App = require('./app');

App.Router.map(function() {
   this.resource("index",{path: "/"},function(){
    this.resource("index.issue",{path:"/issues/:issue_id"});
   })
   this.resource("milestones", function(){
    this.resource("milstones.issue",{path:"/issues/:issue_id"});
   })
});

App.Router.reopen({
  //location: "history"
});
