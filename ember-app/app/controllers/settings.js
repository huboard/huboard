import Ember from 'ember';

var SettingsController = Ember.Controller.extend({
  isCollaborator: function(){
    return App.get("repo.is_collaborator");
  }.property('App.repo.is_collaborator')
});

export default SettingsController;
