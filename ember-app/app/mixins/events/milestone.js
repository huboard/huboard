import Ember from 'ember';

var MilestoneEventMixin = Ember.Mixin.create({
  hbevents: {
    channel: "model.milestone.repo.full_name",
  },
  _eventHandlers: {
    milestone_reordered: function(message){
      this.get('model.milestone').setProperties({
        description: message.milestone.description,
        _data: message.milestone._data
      });
    },
    _socketDisabled: function(){
      return !!this.get('model.noMilestone');
    }.property('model.noMilestone')
  }
});

export default MilestoneEventMixin;
