import Ember from 'ember';

var EventParsing = Ember.Object.create({
  parse: function(event, handler, context){
    var normalized_event = this._normalize(event, context);
    var meta = this._parseMeta(normalized_event, context);
    meta.handler = handler;
    return meta;
  },
  _normalize: function(event, context){
    var normalized = event;
    var matches = event.match(/\{(.*?)\}/g);
    matches.forEach(function(match){
      var binding = match.substr(1, (match.length - 2));
      normalized = normalized.replace(match, context.get(binding));
    });
    return normalized;
  },
  _parseMeta: function(event, context){
    var keys = event.split(/[ .]/).reverse();
    var channel = keys[3] || context.get(context.hbevents.channel);
    return {
      channel: channel.toLowerCase(),
      type: keys[2],
      identifier: keys[1],
      action: keys[0]
    };
  }
});

export default EventParsing;
