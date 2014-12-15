var BufferedProxy = require("../vendor/buffered-proxy");

var BufferController = Ember.ObjectController.extend({
  bufferedContent: function() {
    return Em.ObjectProxy.extend(BufferedProxy).create({
      content: this.get('content')
    });
  }.property('content')
})

module.exports = BufferController;

