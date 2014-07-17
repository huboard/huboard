function attr(defaultValue) {
  return Ember.computed('data', function (key, value){
    if(arguments.length > 1) {
      this.saveData(key, value);
      return value;
    } else {
      return this.get("data." + key) || defaultValue;
    }
  });
}


var Settings = Ember.Object.extend({
  init: function (){
    this._super.apply(this, arguments);
    this.set("data", this.loadData().settings || {});
  },
  showColumnCounts: attr(false),
  data: {},
  loadData: function () {
    var storage = localStorage.getItem("localStorage:" + this.get("repo.full_name"))
    return storage ? JSON.parse(storage) : {};
  },
  saveData: function(key, value) {
    this.set("data." + key, value)

    var localStorageData = this.loadData();

    localStorageData.settings = this.get("data");

    localStorage.setItem("localStorage:" + this.get("repo.full_name"), JSON.stringify(localStorageData))
  },
  setUnknownProperty: function(key, value) {
    Ember.defineProperty(this, key, attr(false));
    this.set(key, value)
  },
  unknownProperty: function(key) {
    return this.get("data." + key);
  }
});

module.exports = Settings;
