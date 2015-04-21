require("./modal_view")

UpdateEmailView = ModalView.extend({
  processingAction: Ember.computed.alias('controller.processingAction')
});

module.exports = UpdateEmailView;
