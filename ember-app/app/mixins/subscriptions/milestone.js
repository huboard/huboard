import Ember from 'ember';

var MilestoneSubscriptionMixin = Ember.Mixin.create({
  hbsubscriptions: {
    channel: "{model.milestone.repo.full_name}",
  },
  hbsubscribers: {
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

export default MilestoneSubscriptionMixin;
