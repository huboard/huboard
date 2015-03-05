
ddoc = 
  { _id:'_design/Stats'
   , views: {}
  }
  ;

ddoc.views.generalOverview = {
  map: function (doc) {
    emit([doc.meta], null);
  },
  reduce: '_count'
}

ddoc.views.dashboardStats = {
  map: function (doc) {
    if(doc.meta.type == "event" && doc.meta.name == "card:move"){
      emit(["cards moved"], null);
    }
    if(doc.meta.type == "user" && doc.meta.from == "login"){
      emit(["active users"], null);
    }
    if(doc.meta.type == "repo"){
      emit(["total HuBoards"], null);
    }
  },
  reduce: '_count'
}



module.exports = ddoc;

