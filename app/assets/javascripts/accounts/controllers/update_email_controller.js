UpdateEmailForm = Ember.Controller.extend({
  customer: Ember.computed.alias('model.details.card.customer'),
  onChange: (function() {
    var errors;
    errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }).observes('email'),
  isDisabled: (function() {
    return this.get('errors') || this.get('processing');
  }).property('errors'),
  actions: {
    update: function() {
      var self = this;
      this.set('processing', true);
      Ember.$.ajax( {
        url: "/settings/email/" + self.get('customer'),
        data: {billing_email: self.get('email')},
        type: "PUT"})
        .then(function(response){
          self.set('model.details.billing_email', self.get('email'))
          self.set('processing', false);
          self.send('close');
        })
        .fail(function(){
          self.set('errors', 'Your email address could not be updated');
          self.set('processing', false);
        });
    },
    close: function() {
      return this.send("closeModal");
    }
  }
});

module.exports = UpdateEmailForm;
