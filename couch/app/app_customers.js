ddoc = 
  { _id:'_design/Customers'
   , views: {}
  }
  ;

ddoc.views.findByOrgId = {
  map: function (doc) {  
    if(doc.meta.type === "customer") {
      emit(doc.github.org.id, doc); 
    }
  }
}

ddoc.views.findByUserId = {
  map: function(doc) {
    if(doc.meta.type === "customer") {
      emit(doc.github.user.id, doc);
    }
  }
}


module.exports = ddoc;