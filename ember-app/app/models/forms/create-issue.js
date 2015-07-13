import Ember from 'ember';
import correlationId from 'app/utilities/correlation-id';
import Issue from 'app/models/issue';
import Serializable from 'app/mixins/serializable';

var CreateIssue = Ember.Object.extend(Serializable,{
  correlationId: correlationId,
  save: function(order) {
    var order_object = order ? {order: order} : {};
    return Ember.$.ajax( {
      url: "/api/" + this.get("repo.full_name") + "/issues", 
      data: JSON.stringify({issue: this.serialize(), order: order_object, correlationId: this.get("correlationId") }),
      dataType: 'json',
      type: "POST",
      contentType: "application/json"})
      .then(function(response){
        return Issue.create(response);
      });
  }
});

CreateIssue.reopenClass({
  createNew: function(){
     return CreateIssue.create({
       id: null,
       title: "",
       body: "",
       assignee: null,
       milestone: null,
       repo: App.get("repo"),
       labels: []
     });
  }
});

export default CreateIssue;
