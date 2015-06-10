import Ember from 'ember';

var MilestoneFilters = Ember.Service.extend({
  filters: [],
  strategy: "inclusive",

  create: function(model){
    this.set("filters", model.get("filterMilestones").map(function(m){
       return Ember.Object.create({
        name: m.title,
        queryParam: "milestone",
        mode:0,
        condition:function(i){
         return i.milestone && i.milestone.title.toLocaleLowerCase() === m.title.toLocaleLowerCase();
        }
       });
    }));
    this.get("filters").insertAt(0, Ember.Object.create({
      name: 'No milestone',
      queryParam: "milestone",
      mode:0,
      condition:function(i){
        return i.milestone == null;
      }
    }));

    return this.get("filters");
  }
});

export default MilestoneFilters
