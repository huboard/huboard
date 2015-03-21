var HbMilestoneComponent = Ember.Component.extend({
  classNameBindings: [":hb-selector-component", ":dropdown"],
  isOpen: function(){
    return false;
  }.property(),

  listItems: function () {

    return this.get("milestones")
    .filter(function(item) {
      var term = this.get("filterMilestones") || ""
      return item.title.toLowerCase().indexOf(term.toLowerCase() || item.title.toLowerCase()) != -1;
    }.bind(this))
    .map(function(item) {

      return this.ListItem.create({
        selected: item.id == this.get("selected.id"),
        item: item
      })

    }.bind(this));

  }.property("milestones","selected", "filterMilestones"),

  ListItem: Ember.Object.extend({
    selected: false,
    item: null
  }),

  actions: {
    toggleSelector: function(){
      this.set("isOpen", !!!this.$().is(".open"))
      if(this.get("isOpen")) {
        $(".open").removeClass("open")
        this.$().addClass("open")
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();
        this.set("filterMilestones", "")

      } else {
        this.$().removeClass("open")
      }
    },
    assignTo: function(milestone) {
      this.set("selected", milestone);
      this.sendAction("assign", milestone)
      this.$().removeClass("open")
      this.set("isOpen", false);
    },
    clearMilestone: function(){
      this.set("selected", null);
      this.sendAction("assign", "")
      this.$().removeClass("open")
      this.set("isOpen", false);
    }
  },
  didInsertElement: function() {

    $('body').on('keyup.flyout', function(event) {
      if (event.keyCode === 27) this.set("isOpen", false)
    }.bind(this));

  this.$(".hb-flyout").on('click.flyout', function(event){
    if($(event.target).is("[data-ember-action],[data-toggle]")){return;}
    if($(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
    event.preventDefault()
    event.stopPropagation();  
    this.set("isOpen", false)  
  }.bind(this))

  this.$(".close").on('click.flyout', function(event){
    if($(event.target).is("[data-ember-action],[data-toggle]")){return;}
    if($(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
    this.set("isOpen", false)  
  }.bind(this))

  },

  willDestroyElement: function() {
    $('body').off('keyup.flyout');
    this.$(".hb-flyout,.close").off("click.modal");
  }

});

module.exports = HbMilestoneComponent;
