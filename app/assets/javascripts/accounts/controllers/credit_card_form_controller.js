CreditCardForm = Ember.Controller.extend({
  actions: {
    close: function() {
      return this.send("closeModal");
    }
  },
  key: HuboardEnv.stripe_pub_key,
  processingCard: false,
  number: null,
  cvc: null,
  exp: null,
  expMonth: (function() {
    if (this.get("exp")) {
      return Ember.$.payment.cardExpiryVal(this.get("exp")).month || "MM";
    }
    return "MM";
  }).property("exp"),
  expYear: (function() {
    if (this.get("exp")) {
      return Ember.$.payment.cardExpiryVal(this.get("exp")).year || "YYYY";
    }
    return "YYYY";
  }).property("exp"),
  cardType: (function() {
    return Ember.$.payment.cardType(this.get('number'));
  }).property('number'),
  process: function() {
    this.set('processingCard', true);
    Stripe.setPublishableKey(this.get('key'));
    return Stripe.card.createToken({
      number: this.get('number'),
      cvc: this.get('cvc'),
      exp_month: this.get('expMonth'),
      exp_year: this.get('expYear')
    }, this.didProcessToken.bind(this));
  }
});

module.exports = CreditCardForm;
