import Ember from 'ember';

var LabelFilters = Ember.Service.extend({
  filters: [],
  strategy: "grouping",

  create: function(model){
    this.set("filters", model.get("filterLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "label",
        mode:0,
        color: l.color,
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    }));

    return this.get("filters");
  }
});

export default LabelFilters
