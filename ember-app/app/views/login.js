var ModalView = require("./modal_view")
var LoginView = ModalView.extend({
  modalSize: "slimmer",
  didInsertElement: function() {
    App.animateModalOpen();
    this.$(".fullscreen-body").on('click.modal', function(event){
       if(!$(event.target).parents(".hb-selector-component").length) {
        this.$(".open")
          .not($(event.target).parents(".hb-selector-component"))
          .removeClass("open")
       }
       if($(event.target).is("[data-ember-action],[data-toggle]")){return;}
       if($(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
       event.stopPropagation();    
    }.bind(this))

    this.$(':input:not(.close):not([type="checkbox"])').first().focus();
  },
});

module.exports = LoginView;
