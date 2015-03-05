function(doc) {
  if(doc.meta.type == "user") {
     emit([0,doc.login], doc.type)
  }
  if(doc.meta.type == "org") {
     emit([1, doc.login], doc.type)
  }
}