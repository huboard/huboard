import Ember from 'ember';
import BoardSubscriptions from "app/mixins/subscriptions/board";
import Messaging from "app/mixins/messaging";

var ApplicationController = Ember.Controller.extend(
  BoardSubscriptions, Messaging, {
  qps: Ember.inject.service("query-params"),
  isSidebarOpen: false,
  filters: Ember.inject.service(),
  setFilters: function(){
    if(this.get("model.board")){
      this.get("filters.filterGroups").setGroups(this.get("model.board"));
    }
  }.observes("model.board"),

  //Fix the need to delay event subscriptions
  subscribeDisabled: true,

  currentUser: function(){
    return App.get("currentUser");
  }.property("App.currentUser"),
  loggedIn: function(){
    return App.get("loggedIn");
  }.property("App.loggedIn")
});

export default ApplicationController;
