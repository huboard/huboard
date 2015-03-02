var ModalView = Em.View.extend({
  layoutName: "layouts/modal",
  modalSize: "",
  modalCloseCriteria: function(){
    return false;
  },

  didInsertElement: function() {
    App.animateModalOpen();

    $('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) {
        if (this.modalCloseCriteria()) {
          this.send("modalCloseAction");
        } else {
          this.get('controller').send('closeModal');
        }
      }
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
     if(this.modalCloseCriteria()){
       this.send("modalCloseAction");
     } else {
       this.get('controller').send('closeModal');
     }
    }.bind(this))

    this.$(':input:not(.close):not([type="checkbox"])').first().focus();
  },

  willDestroyElement: function() {
    $('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
  },

  actions: {
    modalCloseAction: function(){
     var closeModal = confirm("Any unsaved work may be lost! Continue?");
     if(closeModal){ this.get('controller').send('closeModal'); }
    }
  }
});

module.exports = ModalView;
