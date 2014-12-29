require("./credit_card_form_controller");

PurchaseFormController =  CreditCardForm.extend({
  coupon: null,
  isDisabled: (function() {
    return this.get("isProcessing") || this.get('errors');
  }).property("isProcessing", "errors"),
  onCouponChange: (function() {
    var errors;
    errors = this.get('errors');
    if (errors) {
      return this.set('errors', null);
    }
  }).observes('coupon'),
  price: (function() {
    return this.get("model.amount");
  }).property("plan.amount"),
  didProcessToken: function(status, response) {
    if (response.error) {
      this.set('processingCard', false);
      return this.set('errors', response.error.message);
    } else {
      return this.postCharge(response);
    }
  },
  postCharge: function(token) {
    return this.ajax("/settings/charge/" + this.get("model.org.login"), {
      email: this.get("model.org.billing_email"),
      card: token,
      coupon: this.get("coupon"),
      plan: this.get("model.plan")
    }).then(this.didPurchase.bind(this), this.purchaseDidError.bind(this));
  },
  didPurchase: function(response) {
    this.set('processingCard', false);
    this.set("model.plan.purchased", true);
    this.set("model.details.card", response.card);
    this.set('model.details.discount', response.discount);
    this.set('model.details.has_plan', true);
    return this.send("close");
  },
  purchaseDidError: function(error) {
    this.set('errors', JSON.parse(error.responseText).error.message);
    return this.set('processingCard', false);
  },
  didRejectCoupon: function(error, statusText) {
    return this.set('errors', JSON.parse(error.responseText).error.message);
  },
  clearCouponAlerts: function() {
    return this.set('errors', null);
  },
  ajax: function(url, data, verb) {
    var controller;
    controller = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = verb || 'POST';
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
  actions: {
    couponChanged: function() {
      var coupon_id, success;
      coupon_id = this.get('coupon');
      if (coupon_id === "") {
        return this.clearCouponAlerts();
      }
      return this.ajax("/settings/coupon_valid/" + coupon_id, {}, "GET").then(success = (function() {}), this.didRejectCoupon.bind(this));
    }
  }
});

module.exports = PurchaseFormController;
