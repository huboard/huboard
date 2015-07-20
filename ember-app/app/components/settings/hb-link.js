import Ember from 'ember';

var HbLinkComponent = Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ["isLinked:hb-state-link:hb-state-unlink"],
  classNames: ["hb-widget-link"],
  isLinked: function(){
    return this.get("labels.length") === this.get("link.columns.length");
  }.property("labels.@each","link.columns.@each"),
  isDisabled: false,
  actions: {
    remove: function(link) {
      this.get("links").removeObject(link);
      Ember.$.ajax({
        url: "/api/"+ this.get('settings.model.repository.full_name') + "/links",
        data: {
          link: link.get('label.name')
        },
        type: 'DELETE',

      });
    },
    copy: function(){

      var component = this,
        apiUrl = "/api/" + this.get("link.label.user") + "/" + this.get("link.label.repo") + "/columns";

      component.set('isDisabled', true);

      Ember.$.ajax({
        url: apiUrl,
        dataType: 'json',
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify({
          columns: this.get("labels")
        }),
        success: function(response) {
          component.set("link.columns", Ember.A(response.columns));
          component.set('isDisabled', false);
        }
      });
    }
  }
});

export default HbLinkComponent;
