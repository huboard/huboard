define(["../collections/issues","text!../templates/board.html", "./columnView","./sidebarView", "./headerView","../events/postal","./cssView"], 
       function (issues, template, columnView, sidebarView, headerView, postal) {

  var calculateTallest = function (){

    var tallest = _($("ul")).chain()
      .map(function(ul) {return $(ul).height(); })
      .reduce(function(tallest,height) { return height > tallest ? height : tallest; })
      .value();

    return tallest;
  };

  var animateDrawer = function (direction) {

    switch(direction) {
      case "open":
        $("#drawer")
          .find(".toggle-drawer").removeClass("arrow-right").addClass("arrow-left")
          .end()
          .animate({left: '+=270px'}, 300);
        $("#content").animate({"margin-left": "+=100px"},300);
        break;
      case "close":
        $("#drawer")
          .animate({left: '-=270px'}, 300, function(){
             $(this)
              .find(".toggle-drawer").removeClass("arrow-left").addClass("arrow-right")
              .end();
          });
        $("#content").animate({"margin-left": "-=100px"},300);
    }
  };


   return Backbone.View.extend( {
        el : $('#stage'),
        events: {
          "click .toggle-drawer" : "toggleDrawer"
        },
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
           this.user = params.user;
           this.repo = params.repo;
           this.params = params;
           postal.subscribe("Opened.Issue", $.proxy(this.onOpened,this))
           postal.subscribe("Closed.Issue", $.proxy(this.onClosed,this))
        },
        onOpened: function() {
          this.resizeColumns();
        },
        onClosed: function() {
          this.resizeColumns();
        },
        onfetch: function(data) {
          if (!data.labels.length) {
             window.location.href = "/" + this.user + "/"+ this.repo + "/board/create";
             return;
          }

           var board = $(_.template(template, data)),
               noneBoard = board.clone(),
               noneColumn = _.first(data.labels),
               rest = _.rest(data.labels),
               sidebar = new sidebarView({data:data,params:this.params}),
               searchView = new headerView({data:data, params: this.params}),
               self = this;
           
           $(noneBoard).append(new columnView({column: noneColumn, user:this.user,repo:this.repo}).render().el);

           var width = (100 / rest.length);

           _.each(rest, function (label){
               var column = new columnView({column: label, user:self.user,repo:self.repo});
               var markup = $(column.render().el).css({width:width + "%"});
               $(board).append(markup);
           });

           $("#stage").append(board);

           $("#drawer","#main-stage")
              .append(noneBoard).find(".toggle-drawer").show();

           //$(".sidebar-wrapper").append(userFilter.render().el).show();
           $(".sidebar-wrapper").append(sidebar.render().el).show();

           $('[rel~="twipsy"]').tooltip({live:true});
           this.resizeColumns();
        },
        resizeColumns : function () {
           var tallest = calculateTallest();
           $("ul","#main-stage").css("min-height",tallest);
        },
        toggleDrawer : function (ev) {

          ev.preventDefault();

          var open = $(".toggle-drawer")
            .hasClass("arrow-left");

          open ? animateDrawer("close") : animateDrawer("open");
        }
   });
});
