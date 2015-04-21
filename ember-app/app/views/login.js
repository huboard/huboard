import ModalView from 'app/views/modal';
import animateModalOpen from 'app/config/animate-modal-open';
import Ember from 'ember';


var LoginView = ModalView.extend({
  modalSize: "slimmer",
  didInsertElement: function() {
    animateModalOpen();
    this.$(".fullscreen-body").on('click.modal', function(event){
       if(!Ember.$(event.target).parents(".hb-selector-component").length) {
        this.$(".open")
          .not(Ember.$(event.target).parents(".hb-selector-component"))
          .removeClass("open");
       }
       if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
       if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
       event.stopPropagation();    
    }.bind(this));

    this.$(':input:not(.close):not([type="checkbox"])').first().focus();
  },
});

export default LoginView;
