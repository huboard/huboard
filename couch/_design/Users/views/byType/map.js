function(doc) {
  if(doc.meta.type == "user") {
     emit(doc.login, doc.type)
  }
  if(doc.meta.type == "org") {
     emit(doc.login, doc.type)
  }
}