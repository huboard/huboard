var IntegrationsView = App.ModalView.extend({
  modalSize: "slim",
  setupIndex: function(){
    this.get("controller").send("transitionTo",{name:"index"})
  }.on("didInsertElement")
});

module.exports = IntegrationsView;
