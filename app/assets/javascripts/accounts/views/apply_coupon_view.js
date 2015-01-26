require("./modal_view")

ApplyCouponView = ModalView.extend({
  processingAction: Ember.computed.alias('controller.processingAction')
});

module.exports = ApplyCouponView;
