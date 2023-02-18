migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gjjar5wc",
    "name": "address",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // remove
  collection.schema.removeField("gjjar5wc")

  return dao.saveCollection(collection)
})
