import Ember from 'ember';

var KeypressHandlingMixin = Ember.Mixin.create({

  // Handler for Meta Enter - Default: Enabled
  metaEnterHandler: function(event, handler){
    var enabled = this.metaEnterEnabled();
    var pressed = this.metaEnter(event);
    if (pressed){ handler(enabled); }
  },
  metaEnterEnabled: function(){
    if(this.get("settings.available")) {
      var enabled = this.get('settings.metaEnterEnabled');
      return enabled;
    } else {
      return true;
    }
  },
  metaEnter: function(e){
    return e.keyCode === 13 && e.metaKey;
  },

  // Handler for Enter - Default: Disabled
  enterHandler: function(event, handler){
    var enabled = this.enterEnabled();
    var pressed = this.enter(event);
    if (pressed){ handler(enabled); }
  },
  enterEnabled: function(){
    if(this.get("settings.available")) {
      return this.get('settings.enterEnabled');
    } else {
      return false;
    }
  },
  enter: function(e){
    return e.keyCode === 13;
  }
});

export default KeypressHandlingMixin;
