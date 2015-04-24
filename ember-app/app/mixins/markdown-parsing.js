import Ember from 'ember';
import config from '../config/environment';

var MarkdownParsingMixin = Ember.Mixin.create({
  parsedBody: "",
  commitShaBlacklist: ["acceded", "defaced", "effaced", "facaded", "deedeed"],
  githubUrl: config.github, 

  commitParser: function(body){
    this.set("parsedBody", body);
    var self = this;
    var url_prefix = this.get('githubUrl') + App.get("repo.full_name") + "/commit/";
    var blacklist = this.get("commitShaBlacklist");

    var commit_shas = _.difference(body.match(/(^|\b)([a-f0-9]{7})(?!\S)/g), blacklist);
    commit_shas = _.uniq(commit_shas);
    _.each(commit_shas, function(commit){
      var url = "<a href='" + url_prefix + commit + "' class='commit-link'>" + commit + "</a>";
      self.set("parsedBody", body.replace(new RegExp(commit, 'g'), url));
    });
    return this.get("parsedBody");
  }
});

export default MarkdownParsingMixin;
