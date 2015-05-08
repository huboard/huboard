import CssView from 'app/views/css';
import Board from 'app/models/board';
import Issue from 'app/models/issue';
import Milestone from 'app/models/milestone';
import Ember from 'ember';

var MilestonesRoute = Ember.Route.extend({
  model: function() {
    var repo = this.modelFor("application");
    var linked_boards = repo.fetchLinkedBoards();
    return repo.fetchBoard(linked_boards);
  },

  afterModel: function(model) {
    if (App.get("isLoaded")) {
      return;
    }

    var cssView = CssView.create({
      content: model
    });

    cssView.appendTo("head");

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

  actions: {
    createNewIssue: function(model, order) {
      this.controllerFor("issue.create").set("model", model || Issue.createNew());
      this.controllerFor("issue.create").set("order", order || {});
      this.send("openModal", "issue.create");
    },

    createNewMilestone : function () {
      this.controllerFor("milestones.create").set("model", Milestone.createNew());
      this.send("openModal","milestones.create");
    },

    editMilestone : function (milestone) {
      milestone.originalTitle = milestone.title;
      var controller = this.controllerFor("milestones");
      this.controllerFor("milestones.edit").set("model", Milestone.create(milestone));
      this.send("openModal","milestones.edit");
    },

    archive: function(issue) {
      issue.archive();
    },

    openIssueFullscreen: function(model) {
      this.transitionTo("milestones.issue", model);
    },

    createMilestoneOrAbort: function(argBag) {
      this.render("milestones.missing", {
        into: "application",
        outlet: "modal",
        model: argBag
      });
    },

    forceRepaint: function(target) {
      if (target === "index") {
        return;
      }

      var controller = this.controllerFor("milestones");
      controller.incrementProperty("forceRedraw");
    },

    issueCreated: function(issue) {
      var controller = this.controllerFor("milestones");
      var issues = controller.get("model.issues");
      issues.pushObject(issue);

      Ember.run.schedule("afterRender", controller, function() {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal");
      }.bind(this));
    },

    milestoneCreated: function(milestone){
      var controller = this.controllerFor("milestones");
      var milestones = controller.get("model.milestones");
      milestones.pushObject(milestone);
      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal");
      }.bind(this));
    },

    milestoneUpdated: function(milestone){
      var controller = this.controllerFor("milestones");

      //Replace old milestone data with new
      var milestones = controller.get("model.milestones");
      milestones = milestones.map(m => {
        if (m.title === milestone.originalTitle){
          m.description = milestone.description;
          m.due_on = milestone.due_on;
          return milestone;
        }
        return m;
      });
      controller.set("model.milestones", milestones);

      //Remap issues to new milestone title (if changed)
      var issues = controller.get("model.combinedIssues");
      issues = issues.map(issue => {
        if (issue.milestone && (issue.milestone.title === milestone.originalTitle)){
          issue.milestone.title = milestone.title;
          return issue
        }
        return issue;
      });
      controller.set("model.issues", issues);

      //Remove old milestone from columns (unless title is the same)
      if (milestone.title !== milestone.originalTitle){
        var combined = controller.get("model.combinedMilestones");
        delete combined[milestone.originalTitle.toLowerCase()];
        controller.set("model.combinedMilestones", combined);
      }

      Ember.run.schedule('afterRender', controller, function () {
        controller.incrementProperty("forceRedraw");
        this.send("closeModal");
      }.bind(this));
    }
  }
});

export default MilestonesRoute;
