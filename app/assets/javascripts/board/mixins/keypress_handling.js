var KeypressHandlingMixin = Ember.Mixin.create({
  store: Ember.computed.alias("settings"),
  storeData: function(){
    return this.get("store").loadData()["settings"];
  }.property("store"),

  // Handler for Meta Enter - Default: Enabled
  metaEnterHandler: function(event, handler){
    var enabled = this.metaEnterEnabled();
    var pressed = this.metaEnter(event)
    if (pressed) handler(enabled);
  },
  metaEnterEnabled: function(){
    if(this.get("store.available")) {
      var enabled = this.get('storeData')["metaEnterEnabled"];
      return (enabled == null && enabled == undefined) ? true : enabled
    } else {
      return true;
    }
  },
  metaEnter: function(e){
    return e.keyCode == 13 && e.metaKey;
  },

  // Handler for Enter - Default: Disabled
  enterHandler: function(event, handler){
    var enabled = this.enterEnabled();
    var pressed = this.enter(event)
    if (pressed) handler(enabled);
  },
  enterEnabled: function(){
    if(this.get("store.available")) {
      var enabled = this.get('storeData')["enterEnabled"];
      return (enabled == null || enabled == undefined) ? false : enabled;
    } else {
      return false;
    }
  },
  enter: function(e){
    return e.keyCode == 13;
  }
})

module.exports = KeypressHandlingMixin
