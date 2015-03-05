function(doc) {
  if(doc.meta.type === "customer") {
    emit(doc.github.org.id, doc); 
  }
}
