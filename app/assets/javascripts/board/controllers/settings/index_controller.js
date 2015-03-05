var SettingsController = Ember.Controller.extend({
  store: Ember.computed.alias("settings"),
  storeData: function(){
    return this.get("store").loadData()["settings"];
  }.property("store.changed"),
  storeAvailable: function(){
    var store_data = this.get("storeData")
    return store_data != null && store_data != undefined
  }.property("storeData")
})
module.exports = SettingsController;
