import Ember from 'ember';

var MilestonesMissingRoute = Ember.Route.extend({
  renderTemplate: function(){
    this.render('milestones.missing', {
      into: 'application',
      outlet: 'modal',
      view: 'milestones.missing'
    });
    return true;
  }
});

export default MilestonesMissingRoute;
