var SettingsController = Ember.Controller.extend({
  store: Ember.computed.alias("settings"),
  storeData: function(){
    return this.get("store").loadData()["settings"];
  }.property("store"),
  storeAvailable: function(){
    return this.get("store.available");
  }.property("store.available")
})
module.exports = SettingsController;
