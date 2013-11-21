App.ModalView = Em.View.extend({
  layout: Em.Handlebars.compile("<div class='fullscreen-overlay fixed'><div class='fullscreen-wrapper'><div class='fullscreen-body credit-card'>{{yield}}</div></div></div>"),

  didInsertElement: function() {
    App.animateModalOpen();

    $('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) this.get('controller').send('close');
    }.bind(this));
    
    this.$(".fullscreen-body").on('click.modal', function(event){
       event.stopPropagation();    
    }.bind(this))
     
    this.$(".fullscreen-overlay, .close").on('click.modal', function(event){
     this.get('controller').send('close');        
    }.bind(this))
    
   


    this.$(':input:not(.close)').first().focus();
  },

  willDestroyElement: function() {
    $('body').off('keyup.modal');
    this.$(".fullscreen-overlay,.fullscreen-body").off("click.modal");
  }
});
