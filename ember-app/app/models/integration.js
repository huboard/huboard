import Ember from 'ember';

var Integration = Ember.Object.extend({
  keys: function() {
    if (!this.get("integration.data")){
      return [];
    }
    return Object.keys(this.get("integration.data")).map(function(key){
      return {
        key: key,
        value: this.get("integration.data."+key)
      };
    }.bind(this));
  }.property("integration.data")

});

export default Integration;
