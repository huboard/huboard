var App = require('./app');

App.Router.map(function() {
   this.resource("index",{path: "/"},function(){
    this.resource("issue",{path:"/issues/:issue_id"});
   })
});

