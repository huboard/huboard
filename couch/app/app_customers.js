ddoc = 
  { _id:'_design/Customers'
   , views: {}
  }
  ;

ddoc.views.findPlanById = {
  map: function(doc) {
    if(doc.meta.type === "customer") {
      emit(doc.github.account.id, doc);
    }
  }
}

ddoc.views.findByLogin = {
  map: function(doc) {
    if(doc.meta.type === "customer") {
      emit(doc.github.user.login, doc);
    }
  }
}


module.exports = ddoc;
