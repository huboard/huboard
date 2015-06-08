import Ember from 'ember';

var MilestoneFilters = Ember.Service.extend({
  filters: [],
  create: function(model){
    this.set("filters", model.get("filterMilestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        queryParam: "milestone",
        mode:0,
        strategy: "inclusive",
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       });
    }));
    this.get("filters").pushObject(Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestone",
      mode:0,
      strategy: "inclusive",
      condition:function(i){
        return i.milestone == null;
      }
    }));

    return this.get("filters");
  }
});

export default MilestoneFilters
