define(["./views/board", "../common/shortcuts"], function (board, shortcuts) {
   var app = {};
   return {

    init: function (params) {
      app.board = new board(params);

      shortcuts.init();
    }
   }
});
