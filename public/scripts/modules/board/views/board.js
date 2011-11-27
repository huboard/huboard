define(["../collections/issues","text!../templates/board.tmpl", "./columnView"], function (issues, template, columnView) {

  var calculateTallest = function (){

    var tallest = _($("ul")).chain()
      .map(function(ul) {return $(ul).height(); })
      .reduce(function(tallest,height) { return height > tallest ? height : tallest; })
      .value();

    return tallest;
  };

   return Backbone.View.extend( {
        el : $('#stage'),
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
        },
        onfetch: function(data) {
           var board = $(_.template(template, data));
           var noneBoard = board.clone();
           var noneColumn = _.first(data.labels);
           var rest = _.rest(data.labels)
           
           $("tr",noneBoard).append(new columnView({column: noneColumn}).render().el);

           _.each(rest, function (label){
               var column = new columnView({column: label});
               $("tr",board).append(column.render().el);
           });

           $("#stage").html(board);
           $(".sidebar","#main-stage").append(noneBoard);

           var tallest = calculateTallest();
           $("ul","#main-stage").height(tallest);
        }
   });
});
