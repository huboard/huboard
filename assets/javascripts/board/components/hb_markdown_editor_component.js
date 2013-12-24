var Markdown = require("../vendor/marked");


var HbMarkdownEditorComponent = Ember.Component.extend({
  classNames: ["markdown-editor"],
  init: function () {
    this._super.apply(this, arguments);
    var that = this;
    Markdown(this.get('markdown') || "Nothing to preview",{gfm: true},function (err, content) {
      that.set("preview",content);
    });
  },
  markdown: "",
  preview: "",
  onMarkdownChange: function () {
    var that = this;
    return Ember.run.once(function () {
       var markdown = that.get("markdown");

       Markdown(markdown || "Nothing to preview",{gfm: true},function (err, content) {
         that.set("preview",content);
       });
    });
  }.observes("markdown")
});

module.exports = HbMarkdownEditorComponent;

