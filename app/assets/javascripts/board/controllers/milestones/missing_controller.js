var MilestonesMissingController = Ember.ObjectController.extend({
  actions: {
    closeModal: function(){
      this.get("model.onReject").call(this.get("columnController"), this)
      return true;
    },
    createTheMilestone: function() {
      // ajax save
      this.get('target').send('closeModal')
    }
  }

});

module.exports = MilestonesMissingController;
