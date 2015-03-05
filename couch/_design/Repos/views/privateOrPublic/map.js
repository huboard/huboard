function(doc) {
  if(doc.meta.type == "repo" && doc.private) {
    emit(doc.full_name, doc.private)  
}
}