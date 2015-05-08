import correlationId from 'app/utilities/correlation-id';
import Serializable from 'app/mixins/serializable';
import Ember from 'ember';

var Milestone = Ember.Object.extend(Serializable,{
  correlationId: correlationId,
  saveNew: function () {
    this.setDateToISO("due_on");
    return Ember.$.ajax( {
      url: "/api/" + this.get("repo.full_name") + "/milestones",
      data: JSON.stringify({milestone: this.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"}).then(function(response){
        return Milestone.create(response);
    });
  },
  saveEdit: function () {
    var user = this.get("repo.owner.login"),
        repo = this.get("repo.name"),
        full_name = user + "/" + repo;

    this.setDateToISO("due_on");
    return Ember.$.ajax( {
      url: "/api/" + full_name + "/milestones/" + this.get("number"),
      data: JSON.stringify({milestone: this.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "PUT",
      contentType: "application/json"}).then(function(response){
      return Milestone.create(response);
    });
  },
  saveLinkedEdit: function(board, title){
    var milestone = _.find(board.milestones, milestone => {
      return milestone.title === title;
    });

    return Ember.$.ajax( {
      url: "/api/" + board.full_name + "/milestones/" + milestone.number,
      data: JSON.stringify({milestone: this.serialize(), correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "PUT",
      contentType: "application/json"});
  },
  processing: false,
  loaded: false,
  serializeDueOn: function(){
    this.setISOToDate("due_on");
  }.on("init")
});

Milestone.reopenClass({
  createNew: function(){
     return Milestone.create({
       id: null,
       title: "",
       description: "",
       due_on: "",
       repo: App.get("repo")
     });
  }
});

export default Milestone;
