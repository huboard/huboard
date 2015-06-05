import Ember from 'ember';

var LabelFilters = Ember.Service.extend({

  create: function(model){
    var filter = [];

    filter = model.get("filterLabels").map(function(l){
       return Ember.Object.create({
        name: l.name,
        queryParam: "label",
        mode:0,
        color: l.color,
        strategy: "grouping",
        condition:function(i){
          return _.union(i.labels, i.other_labels).any(function(label){ 
             return l.name.toLocaleLowerCase() === label.name.toLocaleLowerCase();
          });
        }
       });
    });

    return filter
  }
});

export default LabelFilters
