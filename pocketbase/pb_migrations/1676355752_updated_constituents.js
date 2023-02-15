migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("691nrsr5tauqxxv")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w63xppzu",
    "name": "benefits",
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
  collection.schema.removeField("w63xppzu")

  return dao.saveCollection(collection)
})
