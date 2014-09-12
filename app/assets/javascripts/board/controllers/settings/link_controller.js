var SettingsLinkController = Ember.ObjectController.extend({
  needs: ["settings", "settingsLinks"],
  isLinked: function(){
    return this.get("controllers.settings.column_labels.length") === this.get("columns.length")

  }.property("controllers.settings.column_labels.@each","column_labels.@each"),
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
    }
  }


});

module.exports = SettingsLinkController;

