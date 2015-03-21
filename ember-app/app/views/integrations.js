import ModalView from 'app/views/modal';

var IntegrationsView = ModalView.extend({
  modalSize: "slim",
  setupIndex: function(){
    this.get("controller").send("transitionTo",{name:"index"})
  }.on("didInsertElement")
});

export default IntegrationsView;
