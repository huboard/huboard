var ModalView = Em.View.extend({
  layoutName: "layouts/modal",
  modalSize: "",

  didInsertElement: function() {
    App.animateModalOpen();

    $('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) this.get('controller').send('closeModal');
    }.bind(this));
    
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
     
    this.$(".fullscreen-overlay, .close").on('click.modal', function(event){
     if($(event.target).is("[data-ember-action],[data-toggle]")){return;}
     if($(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
     this.get('controller').send('closeModal');        
    }.bind(this))

    this.$(':input:not(.close):not([type="checkbox"])').first().focus();
  },

  willDestroyElement: function() {
    $('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
  }
});

module.exports = ModalView;
