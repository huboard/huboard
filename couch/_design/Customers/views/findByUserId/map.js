function(doc) {
  if(doc.meta.type === "customer") {
    emit(doc.github.user.id, doc);
  }
}
