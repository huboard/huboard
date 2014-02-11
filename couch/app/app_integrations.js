
ddoc = 
  { _id:'_design/Integrations'
   , views: {}
  }
  ;

ddoc.views.by_repo = {
  map: function (doc) {
    if(doc.meta.type == "integrations"){
      emit(doc.github.repo.id, doc);
    }
  }
}

ddoc.views.by_full_name = {
  map: function (doc) {
    if(doc.meta.type == "integrations"){
      emit(doc.github.repo.full_name.replace("/","-"), doc);
    }
  }
}

module.exports = ddoc;


