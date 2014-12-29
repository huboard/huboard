AccountController = Ember.ObjectController.extend({
  needs: ["purchaseForm","cancelForm", "updateCard", "applyCoupon"],  
  couponCode: function(){
    return this.get("model.details.discount.coupon.id");
  }.property("model.details.discount","model.details.discount.coupon", "model.details.discount.coupon.id"),
  actions: {
    purchase: function (model) {
      var org = this.get("model.details.org");
      var details = this.get('model.details');
      plan = Ember.Object.create({plan: model, org:org, details: details})
      this.set("controllers.purchaseForm.model", plan)
      this.send("openModal","purchaseForm")
    },
    updateCard: function (model) {
      var org = this.get("model.details.org");
      card = Ember.Object.create({card: model, org:org})
      this.set("controllers.updateCard.model", card)
      this.send("openModal","updateCard")
    },
    cancel: function (model) {
      var org = this.get("model.details.org");
      var details = this.get('model.details');
      plan = Ember.Object.create({plan: model, org:org, details: details})
      this.set("controllers.cancelForm.model", plan)
      this.send("openModal","cancelForm")
    
    },
    applyCoupon: function (model) {
      this.set("controllers.applyCoupon.model", model)
      this.send("openModal","applyCoupon");
    }
  }  
});

modules.exports = AccountController;
