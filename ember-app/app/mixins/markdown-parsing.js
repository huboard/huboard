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

    var commit_shas = this.matchShortSha(body);
    _.each(commit_shas, function(commit){
      var url = "<a href='" + url_prefix + commit + "' class='commit-link'>" + commit + "</a>";
      self.set("parsedBody", body.replace(self.get("shortSha"), url));
    });
    return this.get("parsedBody");
  },
  matchShortSha: function(body){
    var blacklist = this.get("commitShaBlacklist");
    var regexp = this.get("shortSha");
    var commit_shas = _.difference(body.match(regexp), blacklist);
    return _.uniq(commit_shas);
  }
});

export default MarkdownParsingMixin;
