import Ember from 'ember';
import config from '../config/environment'; //jshint ignore:line
import MarkdownParsing from '../mixins/markdown-parsing';

var HbMarkdownEditorComponent = Ember.Component.extend(MarkdownParsing, {
  classNames: ["markdown-editor"],
  init: function () {
    this._super.apply(this, arguments);
    var that = this;
    marked(this.get('markdown') || "Nothing to preview",{gfm: true},function (err, content) {
      that.set("preview",content);
    });
  },
  markdown: "",
  preview: "",
  mentions: [],
  onMarkdownChange: function () {
    var self = this;
    return Ember.run.once(function () {
       var markdown = self.get("markdown");
       marked(markdown || "Nothing to preview",{gfm: true}, self.markdownHandler.bind(self));
    });
  }.observes("markdown"),
  markdownHandler: function(err, content){
    content = this.commitParser(content);
    this.set("preview",content);
  },
  setupTextcomplete: function(){
    var component = this;
    var emojiStrategy = { 
      match: /\B:([\-+\w]*)$/,
      search: function (term, callback) {
        callback(Ember.$.map(_.pairs(window.EMOJIS), function (emoji) {
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
    };

    var mentionStrategy =  { 
      match: /(^|\s)@(\w*)$/,
      search: function (term, callback) {
        callback(component.get('mentions').filter(function(a){
          return a.login.indexOf(term) === 0;
        }));
      },
      template: function (value) {
        return '<img style="height:32px;" src="' + value.avatar_url + '"></img>' + value.login;
      },
      replace: function (value) {
        return '$1@' + value.login + ' ';
      },
      cache: true,
      maxCount: 5
    };
    this.$('textarea').textcomplete([ emojiStrategy, mentionStrategy ]);

  }.on('didInsertElement'),
  cleanUpTextcomplete: function(){
    this.$('textarea').textcomplete('destroy');
  }.on('willDestroyElement')
});

export default HbMarkdownEditorComponent;
