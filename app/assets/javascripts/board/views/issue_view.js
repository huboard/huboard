var ModalView = require("./modal_view")

var IssuesView = ModalView.extend({
  modalCloseCriteria: function(){
    return this.$(".markdown-composer textarea").val().length;
  }
});

module.exports = IssuesView;
