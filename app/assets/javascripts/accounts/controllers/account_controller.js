AccountController = Ember.ObjectController.extend({
  needs: ["purchaseForm","cancelForm", "updateCard", "applyCoupon"],  
  plan: function(){
    plans = this.get("model.details.plans")
    this.set("model.details.plans", Em.A(plans));
    return this.get("model.details.plans.firstObject");
  }.property("model.details.plans"),

  inactive: function(){
    var status =  this.get("plan.status");
    return status == "inactive" || status == "cancelled"
  }.property("plan.status"),
  trialing: function(){
    return this.get("plan.status") == "trialing" && !this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  trialingExpired: function(){
    return this.get("plan.status") == "trialing" && this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  active: function(){
    return this.get("plan.status") == "active";
  }.property("plan.status"),
  newAccount: function(){
    return !this.get("model.details.has_plan");
  }.property("model.details.has_plan"),
  trialExpired: function(){
    var end_time = new Date(this.get("plan.trial_end") * 1000);
    var now = new Date;
    console.log(end_time - now)
    return (end_time - now) < 1
  }.property("plan.trial_end"),

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

module.exports = AccountController;
