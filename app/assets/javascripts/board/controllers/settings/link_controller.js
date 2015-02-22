var SettingsLinkController = Ember.ObjectController.extend({
  needs: ["settings", "settingsLinks"],
  isLinked: function(){
    return this.get("controllers.settings.column_labels.length") === this.get("columns.length")

  }.property("controllers.settings.column_labels.@each","columns.@each"),
  isDisabled: false,
  actions: {
    remove: function(link) {
      this.get("controllers.settingsLinks.model").removeObject(link);
      Ember.$.ajax({
        url: "/api/"+ this.get('controllers.settings.model.repository.full_name') + "/links",
        data: {
          link: link.get('label.name')
        },
        type: 'DELETE',

      })
    },
    copy: function(parent){

      var controller = this,
        apiUrl = "/api/" + this.get("label.user") + "/" + this.get("label.repo") + "/columns";

      controller.set('isDisabled', true);

      Ember.$.ajax({
        url: apiUrl,
        dataType: 'json',
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify({
          columns: this.get("controllers.settings.model.column_labels")
        }),
        success: function(response) {
          controller.set("columns", Ember.A(response.columns))
          controller.set('isDisabled', false);
        }
      })


    }
  }
});

module.exports = SettingsLinkController;

