import Ember from 'ember';

var MilestoneFilters = Ember.Service.extend({

  create: function(model){
    var filter = [];

    filter = model.get("filterMilestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        queryParam: "milestone",
        mode:0,
        strategy: "inclusive",
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       });
    });
    filter.insertAt(0, Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestone",
      mode:0,
      strategy: "inclusive",
      condition:function(i){
        return i.milestone == null;
      }

    }));

    return filter
  }
});

export default MilestoneFilters
