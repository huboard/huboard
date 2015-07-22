//import Board from 'app/models/board';
import Ember from 'ember';
import ajax from 'ic-ajax';

var Board = Ember.Object.extend();

var Repo = Ember.Object.extend({
  //repo: json of repo 
  //labels: []
  //parent: //Repo
  baseUrl: Ember.computed('repo.full_name', {
    get: function(){
      return `/api/${this.get('repo.full_name')}`;
    }
  }),
  fetchLinks: function(){
    var self = this;
    var urls = this.get('linked_repos').map(function(l) {
      return `${self.get('baseUrl')}/linked/${l.user}/${l.repo}`;
    });

    var requests = urls.map((url) => ajax(url));

    return Ember.RSVP.all(requests).then((responses)=>{
      return responses.map((board) => Board.create({ repo:self, board:board}));
    });
  },
  //task_board: boards.find('task'),
  //boards: [TaskBoard, MilestoneBoard, UserBoard,...]
  //links:  [...Repo]
});

export default Repo;
