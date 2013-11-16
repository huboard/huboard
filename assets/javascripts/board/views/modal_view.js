var ModalView = Em.View.extend({
  layoutName: "layouts/modal",

  didInsertElement: function() {
    App.animateModalOpen();

    $('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) this.get('controller').send('closeModal');
    }.bind(this));
    
    this.$(".fullscreen-body").on('click.modal', function(event){
       if($(event.target).is("[data-ember-action]")){return;}
       event.stopPropagation();    
    }.bind(this))
     
    this.$(".fullscreen-overlay, .close").on('click.modal', function(event){
     if($(event.target).is("[data-ember-action]")){return;}
     this.get('controller').send('closeModal');        
    }.bind(this))
    
   


    this.$(':input:not(.close)').first().focus();
  },

  willDestroyElement: function() {
    $('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
  }
});

module.exports = ModalView;
