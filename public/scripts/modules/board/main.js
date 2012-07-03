define(["./views/board"],function (board) {
   var app = {};
   return {

    init: function (params) {
      console.log("params",params)
      app.board = new board(params);


    }
   }
});
