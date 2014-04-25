module.exports.docs_by_type =
  map: (doc) ->
    if doc?.meta?.type
      emit doc.meta.type, null
  reduce: "_count"

module.exports.deleted_grouped_by_account =
  map: (doc) ->
    if doc?.meta?.type == "deleted"
      emit [doc.doc.github.account.login], null
  reduce: "_count"
