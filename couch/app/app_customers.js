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


module.exports = ddoc;
