AccountController = Ember.ObjectController.extend({
  needs: ["purchaseForm","cancelForm", "updateCard", "applyCoupon"],  
  plan: function(){
    var plans = this.get("model.details.plans")
    this.set("model.details.plans", Em.A(plans));
    return this.get("model.details.plans.firstObject");
  }.property("model.details.plans"),
  errorState: function(){
    return this.get("failure") || this.get("trialingExpired");
  }.property("failure", "trialingExpired"),

  nonProfit: function(){
    return this.get("model.details.non_profit") && !this.get("plan");
  }.property("model.details.non_profit", "active"),
  failure: function(){
    return this.get("model.details.success") == false;
  }.property("model.details.success"),
  inactive: function(){
    var trial = this.get("model.details.trial");
    var status = this.get("plan.status");
    return (status == "inactive" || status == "canceled") && trial == "expired";
  }.property("plan.status", "model.details.trial"),
  trialing: function(){
    return this.get("plan.status") == "trialing" && !this.get("trialExpired");
  }.property("plan.status", "trialExpired"),
  trialingExpired: function(){
    return !this.get("active") && !this.get("inactive")  && this.get("trialExpired");
  }.property("active", "inactive", "trialExpired"),
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
  trialButtonDisabled: false,
  trialActivationUrl: function(){
    var path = encodeURIComponent(window.location.pathname + window.location.hash);
    var redirect = "?forward_to=" + path;
    var user = this.get("model.login");
    return "/settings/profile/" + user + "/trial/activate"  + redirect
  }.property("model.login"),
  actions: {
    activateTrial: function(){
      self = this
      this.set("trialButtonDisabled", true)
      Ember.$.ajax( {
        url: self.get("trialActivationUrl"),
        data: {billing_email: self.get("emailBinding")},
        type: "POST"})
        .then(function(response){
          location.reload();
        });
    },
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
