var IssuesCreateView = App.ModalView.extend({
  modalCloseCriteria: function(){
    return this.$(".markdown-composer textarea").val().length;
  },
  focusTitleField: function(){
      Ember.run.schedule('afterRender', this, 'focusTextbox');
  }.on('init'),
  focusTextbox: function(){
    var input = this.$('input:first');
    input.focus();
    input.val(input.val());
  }
});

module.exports = IssuesCreateView;
