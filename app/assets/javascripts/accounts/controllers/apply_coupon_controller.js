require("./coupon_controller");

ApplyCouponController = Ember.ObjectController.extend(CouponController, {
  coupon: null,
  customer: Ember.computed.alias('model.details.card.customer'),
  isDisabled: (function() {
    return this.get('errors') || this.get('processingAction');
  }).property('errors'),
  actions: {
    apply_coupon: function() {
      var coupon_id, customer;
      coupon_id = this.get('coupon');
      customer = this.get('customer');
      this.set('processingAction', true);
      return this.ajax("/settings/redeem_coupon/" + customer, {
        coupon: coupon_id
      }, "PUT").then(this.didAcceptCoupon.bind(this), this.didRejectCoupon.bind(this));
    },
    couponChanged: function() {
      var coupon_id, success;
      coupon_id = this.get('coupon');
      if (coupon_id === "") {
        return this.clearCouponAlerts();
      }
      return this.ajax("/settings/coupon_valid/" + coupon_id, {}, "GET").then(success = (function() {}), this.didRejectCoupon.bind(this));
    },
    close: function() {
      return this.send("closeModal");
    }
  }
});

module.exports = ApplyCouponController
