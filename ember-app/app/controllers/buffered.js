import BufferedProxy from 'ember-buffered-proxy/mixin';
import Ember from 'ember';


var BufferedController = Ember.Controller.extend({
  bufferedContent: function() {
    return Ember.ObjectProxy.extend(BufferedProxy).create({
      content: this.get('content')
    });
  }.property('content')
});

export default BufferedController;
