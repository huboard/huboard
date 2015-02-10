CouponController = Ember.Mixin.create({
  processingAction: false,
  onCouponChange: (function() {
    var errors;
    errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }).observes('coupon'),
  ajax: function(url, data, verb) {
    var controller;
    controller = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = verb || 'GET';
      hash.context = controller;
      hash.data = data;
      hash.success = function(json) {
        return resolve(json);
      };
      hash.error = function(jqXHR, textStatus, errorThrown) {
        return reject(jqXHR);
      };
      return Ember.$.ajax(hash);
    });
  },
  didRejectCoupon: function(error, statusText) {
    this.set('errors', JSON.parse(error.responseText).error.message);
    return this.set('processingAction', false);
  },
  didAcceptCoupon: function(response) {
    this.send('close');
    this.set('processingAction', false);
    return this.set('model.details.discount', response.discount);
  },
  clearCouponAlerts: function() {
    return this.set('errors', null);
  }  
});

module.exports = CouponController;
