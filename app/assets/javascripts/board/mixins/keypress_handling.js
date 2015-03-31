var KeypressHandlingMixin = Ember.Mixin.create({
  // Handler for Meta Enter - Default: Enabled
  metaEnterHandler: function(event, handler){
    var enabled = this.get('metaEnterEnabled');
    var pressed = this.metaEnter(event)
    if (pressed) handler(enabled);
  },
  metaEnterEnabled: Ember.computed.alias("settings.metaEnterEnabled"),  
  metaEnter: function(e){
    return e.keyCode == 13 && e.metaKey;
  },

  // Handler for Enter - Default: Disabled
  enterHandler: function(event, handler){
    var enabled = this.get('enterEnabled');
    var pressed = this.enter(event)
    if (pressed) handler(enabled);
  },
  enterEnabled: Ember.computed.alias("settings.enterEnabled"),  
  enter: function(e){
    return e.keyCode == 13;
  }
})

module.exports = KeypressHandlingMixin
