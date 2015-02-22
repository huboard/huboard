require("./modal_view")

CancelFormView = ModalView.extend({
  processingAction: Ember.computed.alias('controller.processingAction')
});

module.exports = CancelFormView;
