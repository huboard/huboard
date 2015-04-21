import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource("index",{path: "/"},function(){
    this.resource("index.issue",{path:"/issues/:issue_id"});
  });

  this.resource("milestones", function(){
    this.resource("milestones.issue",{path:"/issues/:issue_id"});
  });

  this.resource("settings", function(){

    this.resource('settings.integrations', {path: '/integrations'}, function(){
      this.route('new', {path: '/new/:name'});
    });

    this.resource('settings.links', {path: '/links'}, function(){
      this.route('new', {path: '/new/:name'});
    });

  });
});

export default Router;
