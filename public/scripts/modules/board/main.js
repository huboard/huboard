define(["./views/board"],function (board) {
   var app = {};
   return {

    init: function (params) {

      app.board = new board(params);

    }
   }
});
