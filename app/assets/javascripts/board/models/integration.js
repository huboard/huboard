var Integration = Ember.Object.extend({
  keys: function() {
    if (!this.get("integration.data")){
      return []
    }
    return Ember.keys(this.get("integration.data")).map(function(key){
      return {
        key: key,
        value: this.get("integration.data."+key)
      };
    }.bind(this));
  }.property("integration.data")

});

module.exports = Integration;
