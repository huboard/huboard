function(doc) {
  if(doc.meta.type == "repo") {
    emit([doc.open_issues || 0, doc.full_name, doc.private ? 1 : 0], {private:doc.private})  
  }
}
