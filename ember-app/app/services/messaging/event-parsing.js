import Ember from 'ember';

var EventParsingService = Ember.Service.extend({
  parse: function(event, handler, context){
    var _self = this;
    return {
      channel: _self._parseChannel(event, context),
      identifier: _self._parseIdentifier(event, context),
      action: _self._parseAction(event),
      handler: handler
    };
  },
  _parseChannel: function(event, context){
    var binding_path = event.match(/\{(.*?)\}/)[1];
    return context.get(binding_path).toLowerCase();
  },
  _parseAction: function(event){
    return event.match(/\.(\w+)$/)[1];
  },
  _parseIdentifier(event, context){
    var binding_path = event.match(/\.\{(.*?)\}/)[1];
    return binding_path === "*" ? binding_path :
      context.get(binding_path);
  }
});

export default EventParsingService;
