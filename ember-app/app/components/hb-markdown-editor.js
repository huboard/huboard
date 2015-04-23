import Ember from 'ember';


var HbMarkdownEditorComponent = Ember.Component.extend({
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
  commitBlacklist: ["acceded", "defaced", "effaced", "facaded", "deedeed"]
  commits: [],
  onMarkdownChange: function () {
    var that = this;
    return Ember.run.once(function () {
       var markdown = that.get("markdown");
       marked(markdown || "Nothing to preview",{gfm: true},function (err, content) {
         var possible_commits = content.match(/([a-f0-9]{7})/g);
         _.each(possible_commits, function(hit){
           var match = that.get("commits").filter(function(commit){
             return commit.sha.substring(0,7) === hit;
           });
           if (match.length) {
             var url = "<a href='" + match[0].html_url + "'>" + match[0].sha.substring(0,7) + "</a>";
             content = content.replace(hit, url)
           }
         })
         that.set("preview",content);
       });
    });
  }.observes("markdown"),
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

    var commitStrategy = {
      match: /(^|\s)([a-z0-9]{0,6})$/,
      search: function (term, callback) {
        callback(component.get("commits").filter(function(a){
          return a.sha.substring(0,7).indexOf(term) === 0 && 
            term.length >= 2;
        }));
      },
      template: function (value) {
        return "#" + value.sha.substring(0,7);
      },
      replace: function(value){
        return value.sha.substring(0,7);
      }
    };

    this.$('textarea').textcomplete([ emojiStrategy, mentionStrategy, commitStrategy]);

  }.on('didInsertElement'),
  cleanUpTextcomplete: function(){
    this.$('textarea').textcomplete('destroy');
  }.on('willDestroyElement')
});

export default HbMarkdownEditorComponent;
