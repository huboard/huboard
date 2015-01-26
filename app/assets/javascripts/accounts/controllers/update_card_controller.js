require("./credit_card_form_controller");

UpdateCardController = CreditCardForm.extend({
  didProcessToken: function(status, response) {
    if (response.error) {
      this.set('processingCard', false);
      return this.set('errors', response.error.message);
    } else {
      this.set('errors', "");
      return this.postUpdate(response);
    }
  },
  postUpdate: function(token) {
    return this.ajax("/settings/profile/" + this.get("model.org.login") + "/card", {
      email: this.get("model.org.billing_email"),
      card: token
    }).then(this.didUpdate.bind(this));
  },
  didUpdate: function(response) {
    this.set('processingCard', false);
    this.set('model.card.details.card', response.card);
    return this.send("close");
  },
  ajax: function(url, data) {
    var controller;
    controller = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = 'PUT';
      hash.context = controller;
      hash.data = data;
      hash.success = function(json) {
        return resolve(json);
      };
      hash.error = function(jqXHR, textStatus, errorThrown) {
        return reject(jqXHR);
      };
      return Ember.$.ajax(hash);
    });
  } 
});

module.exports = UpdateCardController;
