require("./modal_view")

UpdateCardView = ModalView.extend({
 processingCard: Ember.computed.alias('controller.processingCard')
});

module.exports = UpdateCardView;
