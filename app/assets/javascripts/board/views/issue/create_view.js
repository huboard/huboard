var IssuesCreateView = App.ModalView.extend({
  modalCloseCriteria: function(){
    var textarea = this.$(".markdown-composer textarea")
    if (textarea.val()){
      return textarea.val().length;
    }
    return false;
  },
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
