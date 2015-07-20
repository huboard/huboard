import CssView from 'app/views/css';
import Board from 'app/models/board';
import CreateIssue from 'app/models/forms/create-issue';
import Issue from 'app/models/issue';
import Milestone from 'app/models/milestone';
import Ember from 'ember';
import animateModalClose from 'app/config/animate-modal-close';

var MilestonesRoute = Ember.Route.extend({
  qps: Ember.inject.service("query-params"),

  model: function() {
    var repo = this.modelFor("application");
    var linked_boards = repo.fetchLinkedBoards();
    return repo.fetchBoard(linked_boards);
  },

  afterModel: function(model) {
    if (App.get("isLoaded")) {
      return;
    }


    return model.linkedBoardsPreload.done(function(linkedBoardsPromise) {
      App.set("isLoaded", true);
      var socket = this.get("socket");

      return linkedBoardsPromise.then(function(boards) {
        boards.forEach(function(b) {
          if (b.failure) {
            return;
          }

          var issues = Ember.A();

          b.issues.forEach(function(i) {
            issues.pushObject(Issue.create(i));
          });

          var board = Board.create(_.extend(b, {
            issues: issues
          }));

          model.linkedRepos.pushObject(board);
          socket.subscribeTo(b.full_name);
        });

        var cssView = CssView.create({
          content: model
        });

        cssView.appendTo("head");

        return boards;
      });
    }.bind(this));
  },

  renderTemplate: function() {
    this._super.apply(this, arguments);

    this.render("assignee", {
      into: "milestones",
      outlet: "sidebarTop"
    });

    this.render("filters", {
      into: "milestones",
      outlet: "sidebarMiddle"
    });
  },
  setupController: function(controller, model){
   this._super(controller, model);
   this.get("qps").applyFilterBuffer();
   this.get("qps").applySearchBuffer();
  },

  actions: {
    createNewIssue: function(issue){
      var issues = this.modelFor("milestones").get("issues");
      issues.pushObject(issue);
    },
    createFullscreenIssue : function (model, order) {
      this.controllerFor("issue.create").set("model", model || CreateIssue.createNew());
      this.controllerFor("issue.create").set("order", order || {});
      this.send("openModal","issue.create");
    },

    createNewMilestone : function () {
      this.controllerFor("milestones.create").set("model", Milestone.createNew());
      this.render("milestones.create", {
        into: "application",
        outlet: "modal"
      });
    },

    editMilestone : function (milestone) {
      milestone.originalTitle = milestone.title;
      this.controllerFor("milestones");
      this.controllerFor("milestones.edit").set("model", Milestone.create(milestone));
      this.render("milestones.edit", {
        into: "application",
        outlet: "modal"
      });
    },

    archive: function(issue) {
      issue.archive();
    },

    openFullscreenIssue: function(model) {
      this.transitionTo("milestones.issue", model);
    },

    createMilestoneOrAbort: function(argBag) {
      this.render('milestones.missing', {
        into: 'application',
        outlet: 'modal',
        view: 'milestones.missing',
        model: argBag
      });
    },

    openModal: function (view){
      this.render(view, {
        into: "application",
        outlet: "modal"
      });
    },
    closeModal: function() {
      animateModalClose().then(function() {
        this.render('empty', {
          into: 'application',
          outlet: 'modal'
        });
      }.bind(this));
    },

    milestoneCreated: function(milestone){
      var controller = this.controllerFor("milestones");
      var milestones = controller.get("model.milestones");
      milestones.pushObject(milestone);
      Ember.run.schedule('afterRender', controller, function () {
        this.send("closeModal");
      }.bind(this));
    },

    milestoneUpdated: function(milestone){
      var controller = this.controllerFor("milestones");

      var self = this;
      Ember.run.once(function(){
        var milestones = controller.get("model.milestones");
        var old_milestone = milestones.find(m => {
          return m.title === milestone.originalTitle
        });
        milestones.removeObject(old_milestone);
        milestones.addObject(milestone);

        //Remap issues to new milestone title (if changed)
        var issues = controller.get("model.combinedIssues");
        issues = issues.forEach(issue => {
          if (issue.milestone && (issue.milestone.title === milestone.originalTitle)){
            issue.set("milestone.title", milestone.title);
            return issue;
          }
          return issue;
        });
        self.send("closeModal");
      });
    }
  }
});

export default MilestonesRoute;
