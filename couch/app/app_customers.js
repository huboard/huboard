ddoc = 
  { _id:'_design/Customers'
   , views: {}
  }
  ;

ddoc.views.findByOrgId = {
  map: function (doc) {  
    if(doc.meta.type === "customer" && doc.github.account.type == "Organization") {
      emit(doc.github.account.id, doc); 
    }
  }
}

ddoc.views.findByUserId = {
  map: function(doc) {
    if(doc.meta.type === "customer" && doc.github.account.type == "User") {
      emit(doc.github.account.id, doc);
    }
  }
}


module.exports = ddoc;
