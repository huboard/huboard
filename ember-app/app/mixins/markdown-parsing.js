import Ember from 'ember';
import config from '../config/environment';

var MarkdownParsingMixin = Ember.Mixin.create({
  parsedBody: "",
  commitShaBlacklist: ["acceded", "defaced", "effaced", "facaded", "deedeed"],
  githubUrl: config.github, 

  shortSha: /(^|\b|\w+"><)([a-f0-9]{7})(?!<\/tt)(?![a-zA-Z0-9])/g,
  longSha: /(^|\b|\w+"><)([a-f0-9]{40})(?!<\/tt)(?![a-zA-Z0-9])/g,

  commitParser: function(body){
    this.set("parsedBody", body);
    var self = this;
    var url_prefix = this.get('githubUrl') + App.get("repo.full_name") + "/commit/";

    body = this.stashUrls(body);
    var commit_shas = this.matchShortSha(body);
    _.each(commit_shas, function(commit){
      var url = "<a href='" + url_prefix + commit + "' class='commit-link'>" + commit + "</a>";
      self.set("parsedBody", body.replace(new RegExp(commit, "g"), url));
    });
    this.restoreUrls();
    return this.get("parsedBody");
  },
  matchShortSha: function(body){
    var blacklist = this.get("commitShaBlacklist");
    var regexp = this.get("shortSha");
    var commit_shas = _.difference(body.match(regexp), blacklist);
    return _.uniq(commit_shas);
  },
  matchLongSha: function(body){
    var regexp = this.get("longSha");
    var commit_shas = body.match(regexp);
    return _.uniq(commit_shas);
  },

  //Methods to simplify the parsing process by replaceing urls with 
  //a placeholder during the search and replace
  stashUrls: function(body){
    var result; var id;
    var stash = {};
    while((result = this.get("urlMatch").exec(body)) !== null){
      id = _.uniqueId("X__HUBOARD__PLACEHOLDER__X");
      body = body.replace(result[0], id);
      stash[id] = result[0];
    }
    this.set("urlStash", stash);
    return body;
  },
  restoreUrls: function(){
    var stash = this.get("urlStash");
    var stash_keys = _.keys(stash);
    var body = this.get("parsedBody");
    _.each(stash_keys, function(key){
      body = body.replace(key, stash[key]);
    });
    this.set("parsedBody", body);
  },
  urlStash: {},

  //http://someweblog.com/url-regular-expression-javascript-link-shortener/
  urlMatch: /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/, 
});

export default MarkdownParsingMixin;
