HistoryController = Ember.ObjectController.extend({
  actions: {
    saveAdditionalInfo: function (model) {
      controller = this;
      controller.set("processing", true);
      return new Ember.RSVP.Promise(function(resolve, reject){
        Ember.$.ajax({
          url: "/settings/profile/" + model.get("login") + "/additionalInfo",
          type: "PUT",
          data: {
            additional_info: model.get("history.additional_info")
          },
          success: function(response){
            resolve(response);
            controller.set("processing", false);
          },
          error: function(response){
            reject(response);
            controller.set("processing", false);
          }
        })
      })
    }
  }
});

module.exports = HistoryController;
