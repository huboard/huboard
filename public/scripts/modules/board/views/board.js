define(["../collections/issues","text!../templates/board.tmpl", "./columnView"], function (issues, template, columnView) {

   return Backbone.View.extend( {
        el : $('#stage'),
        initialize: function (params) {
           issues.bind("ondatareceived", this.onfetch, this);
           issues.fetch(params.user, params.repo);
        },
        onfetch: function(data) {
           $("#stage").html(_.template(template, data));
           _.each(data.labels, function (label){
               var column = new columnView({column: label});
               $('table tr:first','#stage').append(column.render());
           });
        }
   });
});
