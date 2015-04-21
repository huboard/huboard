import Board from 'app/models/board';
import Link from 'app/models/link';
import Integration from 'app/models/integration';
import Issue from 'app/models/issue';
import Serializable from 'app/mixins/serializable';
import Ember from 'ember';
import ajax from 'ic-ajax';




var Repo = Ember.Object.extend(Serializable,{
  userUrl :function () {
    return "/" + this.get("owner.login");
  }.property("owner.login"),
  repoUrl :function () {
    return this.get("userUrl") + "/" + this.get("name");
  }.property("name", "userUrl"),
  fetchBoard: function(linkedBoards){
    if(this._board) {return this._board;}
    var self = this;
    return ajax("/api/" + this.get("full_name") + "/board").then(function(board){
       var issues = Ember.A();
       board.issues.forEach(function(i){
         issues.pushObject(Issue.create(i));
       });
       self._board =  Board.create(_.extend(board, {issues: issues, linkedBoardsPreload: linkedBoards}));
       self.set("board", self._board);
       return self._board;
    });
  },
  fetchLinkedBoards: function(){
    if(this._linkedBoards) {return this._linkedBoards;}
    var self = this;
    return Ember.$.getJSON("/api/" + self.get("full_name") + "/link_labels")
    .then(function(link_labels){
      var urls = link_labels.map(function (l) {
        return "/api/" + self.get("full_name") + "/linked/" + l.user + "/" + l.repo;
      });

      var requests = urls.map(function (url){
        return Ember.$.getJSON(url);
      });

      return Ember.RSVP.all(requests).then(function(boards){
        self._linkedBoards = boards;
        return boards;
      });
    });
  },
  fetchIntegrations: function() {
    if(this._integrations) {return this._integrations;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/integrations")
      .then(function(integrations){
        var results = Ember.A();
        integrations.rows.forEach(function(i){
          results.pushObject(Integration.create(i.value));
        });
        this._integrations = Ember.Object.create({ 
          integrations: results 
        });
        return this._integrations;
      }.bind(this));

  },
  fetchSettings: function(){
    if(this._settings) {return this._settings;}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/settings");
  },
  fetchLinks: function() {
    if(this._links) {return Ember.RSVP.resolve(this._links,"Already fetched links");}
    return Ember.$.getJSON("/api/" + this.get("full_name") + "/links")
      .then(function(links){
        var results = Ember.A();
        links.forEach(function(l){
          results.pushObject(Link.create(l));
        });
        this._links = results; 
        return this._links;
      }.bind(this));

  },
  createLink: function(name){
    var board = this;
    return new Ember.RSVP.Promise(function(resolve, reject){
      board.validateLink(name).then(function(){
        board.fetchLinks().then(function(links){
          var api = "/api/" + board.get("full_name") + "/links";
          return Ember.$.ajax({
            url: api,
            type: 'POST',
            dataType: 'json',
            data: {link: name},
            success: function(response){
              links.pushObject(Ember.Object.create(response));
              resolve(response);
            },
            error: function(jqXHR){
              reject(jqXHR);
            }
          });
        });
      }, function(jqXHR){
        reject(jqXHR);
      });
    });
  },
  validateLink: function(name){
    var api = "/api/" + this.get("full_name") + "/links/validate";
    return Ember.$.post(api, {
      link: name,
    },'json');
  }
});

export default Repo;
