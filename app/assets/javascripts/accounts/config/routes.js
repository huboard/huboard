var App = require('./app');

App.Router.map(function(){
  this.resource("profile", { path: "/:profile_id" });
});
