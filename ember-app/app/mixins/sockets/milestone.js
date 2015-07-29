import Ember from 'ember';

var MilestoneSocketMixin = Ember.Mixin.create({
  milestoneNumber: function(){
    return this.get('model.milestone.number');
  }.property('model.milestone.number'),
  repositoryName: function(){
    return this.get('model.milestone.repo.full_name');
  }.property('model.milestone.repo.full_name'),
  socketDisabled: function(){
    return !!this.get('model.noMilestone');
  }.property('model.noMilestone'),
  sockets: {
    config: {
      messagePath: 'milestoneNumber',
      channelPath: 'repositoryName',
      disabled: 'socketDisabled'
    },
    milestone_reordered: function(){
      //TODO: refactor the model layer so that milestones are always models
      //
      //this.get('model.milestone').setProperties({
        //description: message.milestone.description,
        //_data: message.milestone._data
      //})
    }
  }
});

export default MilestoneSocketMixin;
