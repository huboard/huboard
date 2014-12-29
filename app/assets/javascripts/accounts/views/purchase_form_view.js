require("./modal_view")

PurchaseFormView = ModalView.extend({
  processingPurchase: Ember.computed.alias('controller.processingCard')
});

module.exports = PurchaseFormView;
