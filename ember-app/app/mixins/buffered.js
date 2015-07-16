import BufferedProxy from 'ember-buffered-proxy/mixin';
import Ember from 'ember';

var BufferedMixin = Ember.Mixin.create({
  bufferedContent: function() {
    return Ember.ObjectProxy.extend(BufferedProxy).create({
      content: this.get('content')
    });
  }.property('content')
});

export default BufferedMixin;
