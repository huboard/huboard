
ddoc = 
  { _id:'_design/app'
   , views: {}
  }
  ;

ddoc.views.testView = {
  map: function (doc) {
    emit([doc.meta, "herp_derp"], null);
  },
  reduce: '_count'
}



module.exports = ddoc;