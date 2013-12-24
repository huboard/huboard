function (doc) {
   if(doc.meta.type == "user") {
      emit(doc.login, doc.email)
   }
   if(doc.meta.type == "org") {
      emit(doc.login, doc.email)
   }
}
