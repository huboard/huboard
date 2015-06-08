import Ember from 'ember';

var BoardFilters = Ember.Service.extend({
  filters: [],

  create: function(model){
    var owner = model.get("full_name").split("/")[0];

    this.set("filters", model.get("link_labels").map(function(l){
       var name = owner === l.user ? l.repo : l.user + "/" + l.repo;
       return Ember.Object.create({
        name: name,
        queryParam: "repo",
        mode:0,
        color: l.color,
        strategy: "inclusive",
        condition:function(i){
          return i.repo.name === l.repo && i.repo.owner.login === l.user;
        }
       });
    }));
    this.get("filters").pushObject(Ember.Object.create({
      name: model.get('repo.name'),
      queryParam: "repo",
      mode:0,
      color: "7965cc",
      strategy: "inclusive",
      condition:function(i){
        return i.repo.name === model.get('repo.name');
      }
    }));

    return this.get("filters");
  }
});

export default BoardFilters
