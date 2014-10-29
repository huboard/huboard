var IssueTitleView = Ember.View.extend({
  classNames: ["fullscreen-header"],
  actions: {
    edit: function() {
      Ember.run.schedule('afterRender', this, 'focusTextbox');
      this.get("controller").send("edit");
    }
  },
  focusTextbox: function(){
    var input = this.$('input');
    input.focus();
    input.val(input.val());
  }
})

module.exports = IssueTitleView;
