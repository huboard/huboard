App = Ember.Application.create({
  rootElement : "#main-application"
});

App.animateModalClose = function() {
  var promise = new Ember.RSVP.defer();

  $('body').removeClass("fullscreen-open");
  promise.resolve();


  return promise.promise;
};

App.animateModalOpen = function() {
  var promise = new Ember.RSVP.defer();

   $('body').addClass("fullscreen-open");
  promise.resolve();
  

  return promise.promise;
};

Ember.TextSupport.reopen({
  attributeBindings: ["data-stripe", "autocomplete", "autocompletetype", "required"]
});

App.CvcField = Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-csc",
  format: "123",
  placeholder: Ember.computed.alias("format"),
  autocomplete: "off",
  didInsertElement: function() {
    return this.$().payment("formatCardCVC");
  }
});

App.CardNumberField = Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-number",
  format: "1234 5678 9012 3456",
  placeholder: Ember.computed.alias("format"),
  didInsertElement: function() {
    return this.$().payment("formatCardNumber");
  }
});

App.CardExpiryField = Ember.TextField.extend({
  required: true,
  autocompletetype: "cc-exp",
  format: "MM / YY",
  placeholder: Ember.computed.alias("format"),
  didInsertElement: function() {
    return this.$().payment("formatCardExpiry");
  }
});

App.CouponCodeField = Ember.TextField.extend({
  required: false,
  format: "CODE",
  placeholder: Ember.computed.alias("format"),
  change: function() {
    var controller;
    controller = this.get('targetObject');
    return controller.send('couponChanged');
  }
});

App.CouponCheckbox = Ember.Checkbox.extend({
  required: false
});

module.exports = App;
