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
  }.observes("markdown"),
  setupTextcomplete: function(){
    this.$('textarea').textcomplete([
    { // emoji strategy
            match: /\B:([\-+\w]*)$/,
            search: function (term, callback) {
                callback($.map(_.pairs(window.EMOJIS), function (emoji) {
                    return emoji[0].indexOf(term) === 0 ? {key:emoji[0], value:emoji[1]} : null;
                }));
            },
            template: function (value) {
                return '<img style="height:32px;" src="' + value.value + '"></img>' + value.key;
            },
            replace: function (value) {
                return ':' + value.key + ': ';
            },
            index: 1,
            maxCount: 5
    }
    ])

  }.on('didInsertElement')
});

module.exports = HbMarkdownEditorComponent;

