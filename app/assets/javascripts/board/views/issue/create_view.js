var IssuesCreateView = App.ModalView.extend({
  focusTitleField: function(){
      Ember.run.schedule('afterRender', this, 'focusTextbox');
  }.on('init'),
  focusTextbox: function(){
    var input = this.$('input');
    input.focus();
    input.val(input.val());
  }
});

module.exports = IssuesCreateView;
