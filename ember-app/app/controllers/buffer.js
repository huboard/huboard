import BufferedProxy from 'app/"../vendor/buffered-proxy"';
import Ember from 'ember';


var BufferController = Ember.ObjectController.extend({
  bufferedContent: function() {
    return Ember.ObjectProxy.extend(BufferedProxy).create({
      content: this.get('content')
    });
  }.property('content')
})

export default BufferController;
