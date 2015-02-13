AccountController = Ember.ObjectController.extend({
  needs: ["purchaseForm","cancelForm", "updateCard", "applyCoupon"],  
  plan: function(){
    var plans = this.get("model.details.plans")
    this.set("model.details.plans", Em.A(plans));
    return this.get("model.details.plans.firstObject");
  }.property("model.details.plans"),
  activateTrial: function(){
    var path = encodeURIComponent(window.location.pathname + window.location.hash);
    var redirect = "?forward_to=" + path;
    var user = this.get("model.login");
    return "/settings/profile/" + user + "/trial/activate"  + redirect
  }.property("model.login"),

  inactive: function(){
    var trial = this.get("model.details.trial");
    return this.get("plan.status") == "inactive" && trial == "expired";
  }.property("plan.status", "model.details.trial"),
  trialing: function(){
    return this.get("plan.status") == "trialing" && !this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  trialingExpired: function(){
    return this.get("plan.status") != "active" && this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  active: function(){
    return this.get("plan.status") == "active";
  }.property("plan.status"),
  noAccount: function(){
    var trial = this.get("model.details.trial")
    return !this.get("model.details.has_plan") && trial == "available";
  }.property("model.details.has_plan", "model.details.trial"),
  purchaseWithTrial: function(){
    return this.get("plan.status") == "purchase_with_trial";
  }.property("plan.status"),
  trialExpired: function(){
    var end_time = new Date(this.get("plan.trial_end") * 1000);
    var now = new Date;
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
