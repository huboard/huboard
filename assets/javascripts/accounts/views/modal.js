App.ModalView = Em.View.extend({
  layout: Em.Handlebars.compile("{{yield}}"),

  didInsertElement: function() {
    //App.animateModalOpen();

    $('body').on('keyup.modal', function(event) {
      if (event.keyCode === 27) this.get('controller').send('close');
    }.bind(this));

    this.$(':input').first().focus();
  },

  willDestroyElement: function() {
    $('body').off('keyup.modal');
  }
});
