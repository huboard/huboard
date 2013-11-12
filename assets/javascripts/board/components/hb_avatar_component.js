var HbAvatarComponent = Ember.Component.extend({
   tagName: 'img',
 
  classNames: 'img-responsive',
  attributeBindings: ["src", "title"],
  
  width: 24,
  
  height: 24,
 
  service: 'gravatar',
  title: "",
  src: function() {
    return this[this.get('service')+'Url']();
  }.property('service', 'user'),
 
  gravatarUrl: function() {
    return 'https://secure.gravatar.com/avatar/' + this.get("user") + '?s='+ this.get("width") +'&d=retro';
  }
});

module.exports = HbAvatarComponent;

