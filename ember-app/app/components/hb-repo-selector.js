import Ember from 'ember';

var HbRepoSelectorComponent = Ember.Component.extend({
  classNameBindings: [":hb-selector-component", ":dropdown"],
  isOpen: function(){
    return false;
  }.property(),
  listItems: function () {
    return this.get("repos")
    .filter(function(item) {
      var term = this.get("filterRepos") || "";
      return item.full_name.toLowerCase().indexOf(term.toLowerCase() || item.full_name.toLowerCase()) !== -1;
    }.bind(this))
    .map(function(item) {
      return this.ListItem.create({
        selected: Ember.get(item, 'id') === this.get("selected.id"),
        item: item
      });
    }.bind(this));

  }.property("repos","selected", "filterRepos"),
  ListItem: Ember.Object.extend({
    selected: false,
    item: null
  }),

  actions: {
    toggleSelector: function(){
      this.set("isOpen", !!!this.$().is(".open"));
      if(this.get("isOpen")) {
        Ember.$(".open").removeClass("open");
        this.$().addClass("open");
        this.$(':input:not(.close):not([type="checkbox"])').first().focus();
        this.set("filterRepos", "");

      } else {
        this.$().removeClass("open");
      }
    },
    assignTo: function(repo) {
      this.sendAction("assignRepo", repo);
      this.set('selected', repo);
      this.$().removeClass("open");
      this.set("isOpen", false);
    }
  },

  didInsertElement: function() {
    Ember.$('body').on('keyup.flyout', function(event) {
      if (event.keyCode === 27){ this.set("isOpen", false); }
    }.bind(this));

    this.$(".hb-flyout").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      event.preventDefault();
      event.stopPropagation();  
      this.set("isOpen", false);
    }.bind(this));

    this.$(".close").on('click.flyout', function(event){
      if(Ember.$(event.target).is("[data-ember-action],[data-toggle]")){return;}
      if(Ember.$(event.target).parents("[data-ember-action],[data-toggle]").length){return;}
      this.set("isOpen", false);
    }.bind(this));
  },
  willDestroyElement: function() {
    Ember.$('body').off('keyup.flyout');
    this.$(".hb-flyout,.close").off("click.modal");
  }

});

export default HbRepoSelectorComponent;
