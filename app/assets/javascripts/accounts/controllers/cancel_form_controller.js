CancelFormController = Ember.Controller.extend({
  processingAction: false,
  actions: {
    close: function() {
      return this.send("closeModal");
    },
    cancel: function() {
      this.set('processingAction', true);
      return this.ajax("/settings/profile/" + this.get("model.org.login") + "/plans/" + this.get('model.plan.id'), {}).then(this.didCancel.bind(this), this.cancelDidError.bind(this));
    }
  },
  didCancel: function() {
    this.set('model.details.plans.firstObject.status', 'inactive');
    this.set('model.details.trial', "expired");
    this.set('model.details.has_plan', false);
    this.set('model.details.discount', null);
    this.set('processingAction', false);
    this.set("model.plan.purchased", false);
    this.set("model.details.card", null);
    return this.send("closeModal");
  },
  cancelDidError: function(error) {
    this.set('errors', error.responseJSON.error.message);
    return this.set('processingAction', false);
  },
  ajax: function(url, data) {
    var controller;
    controller = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash;
      hash = {};
      hash.url = url;
      hash.type = 'DELETE';
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

module.exports = CancelFormController;
