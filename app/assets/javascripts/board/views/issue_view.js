var ModalView = require("./modal_view")

var IssuesView = ModalView.extend({
  modalCloseCriteria: function(){
    var textarea = this.$(".markdown-composer textarea")
    if (textarea.val()){
      return textarea.val().length;
    }
    return false;
  }
});

module.exports = IssuesView;
