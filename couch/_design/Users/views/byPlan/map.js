function(doc) {
  if(doc.meta.type == "user" && doc.plan) {
     emit([doc.login,doc.type], doc.plan)
  }
  if(doc.meta.type == "org" && doc.plan) {
     emit([doc.login, doc.type], doc.plan)
  }
}